<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class log_queue_m extends MY_Model {

    protected $_table_name = 'log_queue';
    protected $_primary_key = 'id';
    protected $_primary_filter = 'intval';
    protected $_order_by = "created_at ASC";

    function __construct() {
        parent::__construct();
    }

    function enqueue($data) {
        return parent::insert($data);
    }

    function get_pending($limit = 100) {
        $this->db->where('status', 'pending');
        $this->db->where('retry_count <', 3);
        $this->db->order_by('created_at', 'ASC');
        $this->db->limit($limit);
        return $this->db->get($this->_table_name)->result();
    }

    function update_status($id, $status, $retry_count = null) {
        $data = ['status' => $status];
        if ($retry_count !== null) {
            $data['retry_count'] = $retry_count;
        }
        $this->db->where('id', $id);
        $this->db->update($this->_table_name, $data);
    }
}