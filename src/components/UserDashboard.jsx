import React, { useState, useEffect } from 'react';
import Logout from './Logout.jsx';
import { TbLogout } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api';

const UserDashboard = ({setAuthToken}) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectProgress, setProjectProgress] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [error, setError] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: ''
  });
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: ''
  });

  const getAuthToken = () => localStorage.getItem('jwtToken');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

  useEffect(() => {
    fetchProjects();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectTasks(selectedProject.id);
      fetchProjectProgress(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0]);
        }
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const fetchProjectTasks = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
      headers: getHeaders()
    });
    if (response.ok) {
      const data = await response.json();
      // Ensure every task has a priority
      const normalizedTasks = data.map(task => ({ priority: 'MEDIUM', ...task }));
      setTasks(normalizedTasks);
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
  }
};

  const fetchProjectProgress = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/progress`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setProjectProgress(data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const handleCreateProject = async () => {
  if (!projectForm.title || !projectForm.description) return;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects`,
      projectForm,
      { headers: getHeaders() } 
    );
    console.log(response.data);
    setProjects([...projects, response.data]);
    setShowProjectModal(false);
    setProjectForm({ title: '', description: '' });
  } catch (err) {
    console.error(err.response?.data || err.message);
    setError('Error creating project');
  }
};

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/auth/me", {
        headers: getHeaders()
      });
      setCurrentUser(response.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedProject || !taskForm.title || !taskForm.description) return;

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskForm)
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
        setShowTaskModal(false);
        fetchProjectProgress(selectedProject.id);
      }
    } catch (err) {
      setError('Error creating task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: getHeaders()
      });
      
      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        ));
        fetchProjectProgress(selectedProject.id);
      }
    } catch (err) {
      setError('Error completing task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
        fetchProjectProgress(selectedProject.id);
      }
    } catch (err) {
      setError('Error deleting task');
    }
  };

  

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <h1>Hello , <span style={{color:"#16bde7ff"}}>{currentUser?.name || 'User'}</span></h1>
          {showLogout &&
            <Logout setAuthToken={setAuthToken} setShowLogout={setShowLogout} />
          }
          <button className="logout-button" onClick={() => setShowLogout(true)}><TbLogout color='red' /></button>
        </div>
      </header>

      

      <div className="container">
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <div className="grid">
          {/* Projects Sidebar */}
          <div className="projects-sidebar">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Projects</h2>
                <button onClick={() => setShowProjectModal(true)} className="icon-btn icon-btn-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                </button>
              </div>
              <div className="projects-list">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                  >
                    <h3 className="project-name">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                  </button>
                ))}
                {projects.length === 0 && (
                  <div className="empty-state">
                    <p>No projects yet</p>
                    <p className="empty-state-subtitle">Create your first project to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {selectedProject ? (
              <>
                {/* Project Header */}
                <div className="card">
                  <div className="project-header">
                    <h2 className="project-title">{selectedProject.title}</h2>
                    <p className="project-desc">{selectedProject.description}</p>
                    
                    {projectProgress && (
                      <div className="progress-section">
                        <div className="progress-info">
                          <span className="progress-label">Progress</span>
                          <span className="progress-count">
                            {projectProgress.completedTasks} / {projectProgress.totalTasks} tasks
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${projectProgress.progressPercentage}%` }}
                          />
                        </div>
                        
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Tasks</h3>
                    <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Task
                    </button>
                  </div>
                  
                  <div className="tasks-list">
                    {tasks.map(task => (
                      <div key={task.id} className="task-item">
                        <button
                          onClick={() => {
                            if (!task.completed) {
                              if (window.confirm('Are you sure you want to mark this task as completed?')) {
                                handleCompleteTask(task.id);
                              }
                            }
                          }}
                          className="task-checkbox"
                          disabled={task.completed}
                        >
                            {task.completed ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-completed">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-uncompleted">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          )}
                        </button>
                        
                        <div className="task-content">
                          <h4 className={`task-title ${task.completed ? 'completed' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="task-description">{task.description}</p>
                          <div className="task-meta">
                          
                            {task.dueDate && (
                              <span className="due-date">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button className="delete-btn" onClick={() => {
                          if (window.confirm('Are you sure you want to delete this task ?')) {
                            handleDeleteTask(task.id);
                          }
                        }}>
                          <MdDelete /> 
                        </button>
                      </div>
                    ))}
                    
                    {tasks.length === 0 && (
                      <div className="empty-state">
                        <p>No tasks yet</p>
                        <p className="empty-state-subtitle">Add your first task to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="card empty-project">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="empty-icon">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <h3 className="empty-title">No Project Selected</h3>
                <p className="empty-subtitle">Select a project from the sidebar or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Create New Project</h2>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="form-input"
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter project description"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowProjectModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateProject} className="btn btn-primary">
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Create New Task</h2>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="form-input"
                  placeholder="Enter task title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="form-select"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date (optional)</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowTaskModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateTask} className="btn btn-primary">
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;