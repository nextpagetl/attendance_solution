<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class SmsQueue extends CI_Controller {

    function __construct() {
        parent::__construct();
        $this->load->model('sms_queue_m');
        $this->load->model('smssettings_m');
        $this->load->model('mailandsms_m');
        $this->load->model('setting_m');
    }

    public function process() {
        $pending_sms = $this->sms_queue_m->get_pending();
        if (empty($pending_sms)) {
            echo json_encode(['status' => 'success', 'message' => 'No pending SMS']);
            return;
        }

        $bulk_bind = [];
        $get_bulks = $this->smssettings_m->get_order_by_bulk();
        foreach ($get_bulks as $get_bulk) {
            $bulk_bind[$get_bulk->field_names] = $get_bulk->field_values;
        }
        $url = "http://bulksmsbd.net/api/smsapi";
        $api_key = $bulk_bind['bulk_password'];
        $senderid = $bulk_bind['bulk_username'];

        foreach ($pending_sms as $sms) {
            $data = [
                "api_key" => $api_key,
                "senderid" => $senderid,
                "number" => $sms->phone,
                "message" => $sms->message
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $response = curl_exec($ch);
            curl_close($ch);

            $status = json_decode($response, true);
            if ($status && $status['response_code'] == 202) {
                $this->sms_queue_m->update_status($sms->id, 'sent');
                $this->mailandsms_m->insert_mailandsms([
                    'usertypeID' => 3,
                    'userID' => $sms->student_id,
                    'phone_no' => $sms->phone,
                    'type' => 'Sms',
                    'message' => $sms->message,
                    'date' => date('Y-m-d'),
                    'create_date' => date('Y-m-d H:i:s'),
                    'year' => date('Y'),
                    'senderusertypeID' => 1,
                    'senderID' => 1,
                    'sms_count' => 1,
                    'is_send' => 1,
                    'smsType' => $sms->sms_type
                ]);
            } else {
                $retry_count = $sms->retry_count + 1;
                $this->sms_queue_m->update_status($sms->id, 'failed', $retry_count, $status['error_message']);
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'Processed ' . count($pending_sms) . ' SMS']);
    }
}