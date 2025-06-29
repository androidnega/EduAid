import React, { useState } from 'react';

interface TaskFormData {
  title: string;
  taskType: string;
  frameworks: string[];
  description: string;
}

export default function TaskForm() {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    taskType: '',
    frameworks: [],
    description: ''
  });

  const pythonFrameworks = [
    'FastAPI',
    'Flask',
    'Django',
    'Pyramid',
    'aiohttp',
    'Tornado',
    'Sanic',
    'Dash',
    'Streamlit',
    'Starlette'
  ];

  const handleFrameworkChange = (framework: string) => {
    setFormData(prev => ({
      ...prev,
      frameworks: prev.frameworks.includes(framework)
        ? prev.frameworks.filter(f => f !== framework)
        : [...prev.frameworks, framework]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data:', formData);
  };

  return (
    <div className="task-form">
      <h2>Submit Your Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskType">Task Type</label>
          <select
            id="taskType"
            value={formData.taskType}
            onChange={(e) => setFormData(prev => ({ ...prev, taskType: e.target.value }))}
            required
          >
            <option value="">Select Task Type</option>
            <option value="coding">Coding</option>
            <option value="web">Web Development</option>
            <option value="miniProject">Mini Project</option>
          </select>
        </div>

        <div className="form-group">
          <label>Python Frameworks</label>
          <div className="frameworks-grid">
            {pythonFrameworks.map(framework => (
              <label key={framework} className="framework-checkbox">
                <input
                  type="checkbox"
                  checked={formData.frameworks.includes(framework)}
                  onChange={() => handleFrameworkChange(framework)}
                />
                {framework}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <button type="submit">Submit Task</button>
      </form>

      <style jsx>{`
        .task-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        input[type="text"],
        select,
        textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        textarea {
          min-height: 100px;
        }
        
        .frameworks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        
        .framework-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        button {
          background-color: #0070f3;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:hover {
          background-color: #0051cc;
        }
      `}</style>
    </div>
  );
} 