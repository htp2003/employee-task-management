import { useState, useEffect } from 'react';
import axios from 'axios';

function OwnerTasks() {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: ''
    });

    const loadTasks = async () => {
        console.log('loading tasks...');

        try {
            const res = await axios.get('http://localhost:5000/api/owner/getAllTasks');
            console.log('got tasks:', res.data);

            if (res.data.tasks) {
                setTasks(res.data.tasks);
            } else {
                console.log('no tasks');
                setTasks([]);
            }
        } catch (err) {
            console.log('load tasks error:', err);
            alert('Failed to load tasks');
        }
    };

    const loadEmps = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/owner/getAllEmployees');

            if (res.data.employees) {
                setEmployees(res.data.employees);
                console.log('loaded employees for dropdown');
            }
        } catch (err) {
            console.log('load emps error:', err);
        }
    };

    const createTask = async () => {
        if (!taskForm.title || !taskForm.assignedTo) {
            alert('need title and employee');
            return;
        }

        setLoading(true);
        console.log('creating task:', taskForm.title);

        try {
            const res = await axios.post('http://localhost:5000/api/owner/createTask', taskForm);

            if (res.data.success) {
                console.log('task created:', res.data.taskId);
                alert('Task assigned!');
                setTaskForm({ title: '', description: '', assignedTo: '', dueDate: '' });
                setShowForm(false);
                loadTasks();
            } else {
                alert('create failed');
            }
        } catch (error) {
            console.log('create error:', error);
            alert('Error creating task');
        }

        setLoading(false);
    };

    const deleteTask = async (taskId, title) => {
        if (!confirm(`Delete task: ${title}?`)) return;

        console.log('deleting task:', taskId);

        try {
            const res = await axios.post('http://localhost:5000/api/owner/deleteTask', {
                taskId: taskId
            });

            if (res.data.success) {
                console.log('task deleted');
                alert('Task deleted');
                loadTasks();
            } else {
                alert('Delete failed');
            }
        } catch (err) {
            console.log('delete error:', err);
            alert('Error deleting task');
        }
    };

    const getEmpName = (empId) => {
        const emp = employees.find(e => e.id === empId);
        return emp ? emp.name : 'Unknown';
    };

    const getStatusColor = (status) => {
        if (status === 'done') return '#28a745';
        if (status === 'in_progress') return '#ffc107';
        return '#6c757d';
    };

   const formatDate = (dateObj) => {
    console.log('formatting date:', dateObj);
    
    if (!dateObj) return 'No date';

    try {
        // firebase timestamp with underscore prefix
        if (dateObj._seconds) {
            const date = new Date(dateObj._seconds * 1000);
            return date.toLocaleDateString();
        }

        // firebase timestamp without underscore  
        if (dateObj.seconds) {
            const date = new Date(dateObj.seconds * 1000);
            return date.toLocaleDateString();
        }

        // if it's already a date string
        if (typeof dateObj === 'string') {
            const date = new Date(dateObj);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString();
            }
        }

        // regular date object
        if (dateObj instanceof Date) {
            return dateObj.toLocaleDateString();
        }

        // try converting to date
        const date = new Date(dateObj);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
        }

        return 'Invalid date';
    } catch (err) {
        console.log('date format error:', err);
        return 'Invalid date';
    }
};

    useEffect(() => {
        console.log('tasks page loaded');
        loadTasks();
        loadEmps();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Task Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                    style={{ width: 'auto', padding: '10px 20px' }}
                >
                    {showForm ? 'Cancel' : 'Assign Task'}
                </button>
            </div>

            {showForm && (
                <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>Assign New Task</h3>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Task title"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            placeholder="Task description"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            className="form-input"
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <select
                            value={taskForm.assignedTo}
                            onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                            className="form-input"
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} - {emp.role}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <input
                            type="date"
                            value={taskForm.dueDate}
                            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <button
                        onClick={createTask}
                        disabled={loading}
                        className="btn-success"
                        style={{ width: 'auto', padding: '10px 20px' }}
                    >
                        {loading ? 'Creating...' : 'Assign Task'}
                    </button>
                </div>
            )}

            <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>All Tasks ({tasks.length})</h2>

                {tasks.length === 0 ? (
                    <p style={{ color: '#666' }}>No tasks assigned yet</p>
                ) : (
                    <div>
                        {tasks.map((task, idx) => (
                            <div
                                key={task.id || idx}
                                style={{
                                    padding: '15px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    backgroundColor: '#f8f9fa'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{task.title}</h4>
                                        {task.description && (
                                            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                                                {task.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#666' }}>
                                            <span><strong>Assigned to:</strong> {getEmpName(task.assignedTo)}</span>
                                            <span><strong>Status:</strong>
                                                <span style={{
                                                    color: getStatusColor(task.status),
                                                    fontWeight: 'bold',
                                                    marginLeft: '5px'
                                                }}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </span>
                                            {task.dueDate && (
                                                <span><strong>Due:</strong> {formatDate(task.dueDate)}</span>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#999' }}>
                                            Created: {formatDate(task.createdAt)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteTask(task.id, task.title)}
                                        style={{
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OwnerTasks;