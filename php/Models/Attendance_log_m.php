<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class attendance_log_m extends MY_Model {

    protected $_table_name = 'attendance_logs';
    protected $_primary_key = 'id';
    protected $_primary_filter = 'intval';
    protected $_order_by = "id DESC";

    function __construct() {
        parent::__construct();
    }

    function save_log($data) {
        $records = $data['record'];
        foreach ($records as $record) {
            $log = [
                'serial_number' => $data['sn'],
                'enroll_id' => $record['enrollid'],
                'log_time' => $record['time'],
                'mode' => $record['mode'],
                'inout' => $record['inout'],
                'event' => $record['event'],
                'created_at' => date('Y-m-d H:i:s')
            ];
            parent::insert($log);
        }
    }
}