<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class LogProcessor extends CI_Controller {

    function __construct() {
        parent::__construct();
        $this->load->model('log_queue_m');
        $this->load->model('attendance_log_m');
        $this->load->model('sms_queue_m');
        $this->load->model('setting_m');
        $this->load->model('sattendance_m');
        $this->load->model('tattendance_m');
        $this->load->model('uattendance_m');
        $this->load->model('smssettings_m');
    }

    public function process() {
        $pending_logs = $this->log_queue_m->get_pending();
        if (empty($pending_logs)) {
            echo json_encode(['status' => 'success', 'message' => 'No pending logs']);
            return;
        }

        $schoolyear = $this->config->item('schoolyear');
        $settings = $this->setting_m->get_setting(1);
        $schoolyearID = $settings->school_year;
        $websetting = $this->db->select('site_name_eng')->get_where('websetting', ['site_name_eng !=' => ''])->row();
        $schoolname = $websetting ? $websetting->site_name_eng : '';
        $get_sms_settings = $this->smssettings_m->get_order_by_smsset();

        foreach ($pending_logs as $log) {
            try {
                $data = json_decode($log->raw_data, true);
                if (!$data || !isset($data['sn'], $data['record'])) {
                    $this->log_queue_m->update_status($log->id, 'failed', $log->retry_count + 1);
                    continue;
                }

                $records = $data['record'];
                foreach ($records as $record) {
                    $log_entry = [
                        'serial_number' => $data['sn'],
                        'enroll_id' => $record['enrollid'],
                        'log_time' => $record['time'],
                        'mode' => $record['mode'],
                        'inout' => $record['inout'],
                        'event' => $record['event'],
                        'created_at' => date('Y-m-d H:i:s')
                    ];
                    $this->db->insert('attendance_logs', $log_entry);

                    $enroll_id = $record['enrollid'];
                    $firstCharacter = substr($enroll_id, 0, 1);
                    $user_original_id = (int) substr($enroll_id, 1);
                    $punch_date = date('Y-m-d', strtotime($record['time']));
                    $monthyear = date('m-Y', strtotime($punch_date));
                    $day = (int) date('d', strtotime($punch_date));
                    $current_timestamp = strtotime(date('Y-m-d H:i:s'));
                    $punch_timestamp = strtotime($record['time']);

                    if ($firstCharacter == '1') {
                        $student_attr_id = substr($enroll_id, -6);
                        $this->db->select("student_{$schoolyear}.studentID, student_{$schoolyear}.classesID, student_{$schoolyear}.sectionID, student_{$schoolyear}.name, student_{$schoolyear}.roll, student_{$schoolyear}.phone, classes.classes");
                        $this->db->join('classes', "student_{$schoolyear}.classesID = classes.classesID");
                        $this->db->where("student_{$schoolyear}.schoolyearID", $schoolyearID);
                        $this->db->where("student_{$schoolyear}.student_att_id", (int)$student_attr_id);
                        $this->db->where("student_{$schoolyear}.active", 1);
                        $this->db->where("student_{$schoolyear}.soft_delete", 0);
                        $student = $this->db->get("student_{$schoolyear}")->row();

                        if ($student) {
                            $class = $this->db->get_where('classes', array('classesID' => $student->classesID, 'soft_delete' => 0))->row();
                            
                            $entry_start_time = strtotime($punch_date . ' ' . $class->entry_start_time);
                            $entry_end_time = strtotime($punch_date . ' ' . $class->entry_end_time);
                            $late_count_time = strtotime($punch_date . ' ' . $class->entry_end_time . ' + ' . $class->late_count_after . ' minutes');
                            $departure_start_time = strtotime($punch_date . ' ' . $class->departure_start_time);
                            $departure_end_time = strtotime($punch_date . ' ' . $class->departure_end_time);

                            $column = 'a' . $day;
                            $sms_type = null;
                            $attendance_status = 'P';

                            // Determine SMS type
                            if ($punch_timestamp >= $entry_start_time && $punch_timestamp <= $entry_end_time) {
                                $sms_type = 1; // Present
                            } elseif ($punch_timestamp > $entry_end_time && $punch_timestamp <= $late_count_time) {
                                $sms_type = 4; // Late present
                                $attendance_status = 'L';
                            } elseif ($punch_timestamp >= $departure_start_time && $punch_timestamp <= $departure_end_time) {
                                $sms_type = 3; // Departure
                            }

                            // Update attendance (except for departure)
                            if ($sms_type != 3) {
                                $attendance = $this->sattendance_m->get_order_by_attendance([
                                    'studentID' => $student->studentID,
                                    'schoolyearID' => $schoolyearID,
                                    'classesID' => $student->classesID,
                                    'monthyear' => $monthyear
                                ]);

                                if (!$attendance) {
                                    $this->sattendance_m->insert_attendance([
                                        'studentID' => $student->studentID,
                                        'schoolyearID' => $schoolyearID,
                                        'classesID' => $student->classesID,
                                        'sectionID' => $student->sectionID,
                                        'userID' => 3,
                                        'usertype' => 'Admin',
                                        'monthyear' => $monthyear
                                    ]);
                                }

                                $this->db->where('studentID', $student->studentID);
                                $this->db->where('monthyear', $monthyear);
                                $this->db->update('attendance', [$column => $attendance_status]);
                            }

                            // Enqueue SMS if needed
                            if ($sms_type && $get_sms_settings && json_decode($get_sms_settings->field_values) && $student->phone) {
                                // Check if SMS already queued for this student, date, and type
                                $existing_sms = $this->sms_queue_m->get_single_sms_queue([
                                    'student_id' => $student->studentID,
                                    'date' => $punch_date,
                                    'sms_type' => $sms_type
                                ]);

                                if (!$existing_sms) {
                                    $mailandsmstemplate = $this->db->get_where('mailandsmstemplate', ['sms_type_setting_id' => $sms_type])->row();
                                    if ($mailandsmstemplate) {
                                        $message = str_replace(
                                            ['[name]', '[class]', '[roll]', '[date]', '[schoolname]'],
                                            [$student->name, $student->classes, $student->roll, date('Y-m-d'), $schoolname],
                                            $mailandsmstemplate->template
                                        );
                                        $this->sms_queue_m->enqueue([
                                            'student_id' => $student->studentID,
                                            'phone' => $student->phone,
                                            'message' => $message,
                                            'sms_type' => $sms_type,
                                            'date' => $punch_date,
                                            'status' => 'pending',
                                            'retry_count' => 0
                                        ]);
                                    }
                                }
                            }
                        }
                    } elseif ($firstCharacter == '2') {
                        $attendance = $this->tattendance_m->get_order_by_tattendance([
                            'teacherID' => $user_original_id,
                            'monthyear' => $monthyear
                        ]);

                        if (!$attendance) {
                            $this->tattendance_m->insert_tattendance([
                                'schoolyearID' => $schoolyearID,
                                'teacherID' => $user_original_id,
                                'usertypeID' => 2,
                                'monthyear' => $monthyear
                            ]);
                        }

                        $this->db->where('teacherID', $user_original_id);
                        $this->db->where('monthyear', $monthyear);
                        $this->db->update('tattendance', [$column => 'P']);
                    } elseif ($firstCharacter == '3') {
                        $attendance = $this->uattendance_m->get_order_by_uattendance([
                            'userID' => $user_original_id,
                            'monthyear' => $monthyear
                        ]);

                        if (!$attendance) {
                            $this->uattendance_m->insert_uattendance([
                                'schoolyearID' => $schoolyearID,
                                'userID' => $user_original_id,
                                'usertypeID' => 1,
                                'monthyear' => $monthyear
                            ]);
                        }

                        $this->db->where('userID', $user_original_id);
                        $this->db->where('monthyear', $monthyear);
                        $this->db->update('uattendance', [$column => 'P']);
                    }
                }

                $this->log_queue_m->update_status($log->id, 'processed');
            } catch (Exception $e) {
                $this->log_queue_m->update_status($log->id, 'failed', $log->retry_count + 1);
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'Processed ' . count($pending_logs) . ' logs']);
    }
}