<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class sms_queue_m extends MY_Model {

    protected $_table_name = 'sms_queue';
    protected $_primary_key = 'id';
    protected $_primary_filter = 'intval';
    protected $_order_by = "created_at ASC";

    function __construct() {
        parent::__construct();
    }

    function enqueue($data) {
        return parent::insert($data);
    }

    function get_pending() {
        $this->db->where('status', 'pending');
        $this->db->where('retry_count <', 3);
        $this->db->order_by('created_at', 'ASC');
        return $this->db->get($this->_table_name)->result();
    }

    function update_status($id, $status, $retry_count = null, $error_message = null) {
        $data = ['status' => $status];
        if ($retry_count !== null) {
            $data['retry_count'] = $retry_count;
        }
        if ($error_message !== null) {
            $data['error_message'] = $error_message;
        }
        $this->db->where('id', $id);
        $this->db->update($this->_table_name, $data);
    }
    
    function get_single_sms_queue($array) {
        $this->db->select('*');
        $this->db->from($this->_table_name);
        $this->db->where($array);
        $query = $this->db->get();
        return $query->row();
    }
}