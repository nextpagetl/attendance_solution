<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Attendance extends Frontend_Controller {

    protected $_pageName;
    protected $_templateName;

    function __construct() {
        parent::__construct();
        $this->load->model("log_queue_m");
    }

    public function index() {
        if ($this->input->method() !== 'post') {
            $this->output
                ->set_status_header(405)
                ->set_content_type('application/json')
                ->set_output(json_encode(['status' => 'error', 'message' => 'Method not allowed']));
            return;
        }

        $raw_input = file_get_contents('php://input');
        $data = json_decode($raw_input, true);
        if (!$data || !isset($data['sn'], $data['record'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(['status' => 'error', 'message' => 'Invalid data']));
            return;
        }

        try {
            // Save to log_queue
            $this->log_queue_m->enqueue([
                'serial_number' => $data['sn'],
                'raw_data' => $raw_input,
                'status' => 'pending',
                'retry_count' => 0
            ]);

            // Respond immediately
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode(['status' => 'success', 'message' => 'Log queued']));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(['status' => 'error', 'message' => 'Server error']));
        }
    }
}