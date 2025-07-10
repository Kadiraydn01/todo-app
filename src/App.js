import React, { useState, useEffect , useRef } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [planDate, setPlanDate] = useState("");
  const [completedSearch, setCompletedSearch] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [tick, setTick] = useState(0);


  const dropdownRef = useRef(null);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setDropdownOpenId(null); 
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    setTick((prev) => prev + 1);
  }, 60000);  

  return () => clearInterval(interval);
}, []);





  const API_URL = "https://todo-app-3-xxy8.onrender.com/api/tasks";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error(err));
  }, []);

  const addTask = () => {
    if (!newTaskText.trim()) return;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskText,
        completed: false,
        planDate: null,
      }),
    })
      .then((res) => res.json())
      .then((task) => {
        setTasks((prev) => [task, ...prev]);
        setNewTaskText("");
      })
      .catch((err) => console.error(err));
  };

  const updateTask = (id, data) => {
    fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((updatedTask) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
        );
        setDropdownOpenId(null);
        setModalOpen(false);
        setPlanDate("");
        // Düzenleme kapatma
        setEditTaskId(null);
        setEditTitle("");
      })
      .catch((err) => console.error(err));
  };

  const deleteTask = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setTasks((prev) => prev.filter((t) => t._id !== id));
      })
      .catch((err) => console.error(err));
  };

  // Arkaplan rengini planDate'e göre ayarla
  const getBackgroundColor = (task) => {
    if (!task.planDate) return "bg-gray-50";

    const now = new Date();
    const plan = new Date(task.planDate);
    const diffDays = Math.ceil((plan - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "bg-red-200";
    if (diffDays <= 5) return "bg-yellow-200";
    return "bg-green-200";
  };

  const incompleteTasks = tasks.filter(
    (t) => !t.completed && (t.planDate === null || t.planDate === undefined)
  );
const plannedTasks = tasks
  .filter((t) => !t.completed && t.planDate)
  .sort((a, b) => new Date(a.planDate) - new Date(b.planDate));
const completedTasks = tasks.filter((t) => t.completed);

  const handlePlanClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
    setDropdownOpenId(null);
  };

  const handlePlanSubmit = () => {
    if (!planDate) return;
    updateTask(selectedTask._id, { planDate });
  };

  // Düzenleme işlemleri
  const startEdit = (task) => {
    setEditTaskId(task._id);
    setEditTitle(task.title);
    setDropdownOpenId(null);
  };

  const saveEdit = (id) => {
    if (!editTitle.trim()) return;
    updateTask(id, { title: editTitle });
  };

  const cancelEdit = () => {
    setEditTaskId(null);
    setEditTitle("");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold text-center">Görev Yöneticisi</h1>

      <div className="flex justify-center max-w-xl gap-2 mx-auto mb-8">
        <input
          type="text"
          className="flex-grow p-2 border rounded"
          placeholder="Yeni görev yaz..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button
          onClick={addTask}
          className="px-4 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 mx-auto md:grid-cols-3 max-w-7xl">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-4 text-lg font-semibold text-blue-600">
            Tamamlanmamış Görevler
          </h2>
          <ul
            className="space-y-2"
            style={{ maxHeight: "450px", overflowY: "auto" }}
          >
            {incompleteTasks.length === 0 && (
              <li className="text-gray-500">Görev yok.</li>
            )}
            {incompleteTasks.map((task) => (
              <li
                key={task._id}
                className={`relative p-3 border rounded ${getBackgroundColor(
                  task
                )}`}
              >
                <div className="flex items-center justify-between">
                  {editTaskId === task._id ? (
                    <>
                      <input
                        type="text"
                        className="flex-grow p-1 border rounded"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(task._id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => saveEdit(task._id)}
                          className="text-green-600 hover:underline"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-600 hover:underline"
                        >
                          İptal
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{task.title}</span>
                      <div className="flex items-center gap-2">
                        <button
                        onClick={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const dropdownHeight = 90; // 2 seçenek x 45px gibi düşün
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < dropdownHeight;

  setDropdownPosition({
    top: openUpward ? rect.top + window.scrollY - dropdownHeight : rect.bottom + window.scrollY,
    left: rect.right - 176, // dropdown genişliği kadar sola
  });
  setDropdownOpenId(dropdownOpenId === task._id ? null : task._id);
}}

                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          Seçenekler
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Sil
                        </button>
                        <button
                          onClick={() => startEdit(task)}
                          className="text-sm text-gray-700 hover:underline"
                        >
                          Düzenle
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {dropdownOpenId === task._id && !editTaskId && (
<div ref={dropdownRef}  className="fixed z-50 mt-1 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow" style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>
                    <ul className="py-2 text-sm text-gray-700">
                      <li>
                        <button
                          onClick={() =>
                            updateTask(task._id, { completed: true })
                          }
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          ✅ Tamamla
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handlePlanClick(task)}
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          📅 Planla
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-4 text-lg font-semibold text-purple-600">
            Planlanmış Görevler
          </h2>
          <ul
            className="space-y-2"
            style={{ maxHeight: "280px", overflowY: "auto" }}
          >
            {plannedTasks.length === 0 && (
              <li className="text-gray-500">Planlanmış görev yok.</li>
            )}
            {plannedTasks.map((task) => (
              <li
                key={task._id}
                className={`relative p-3 border rounded ${getBackgroundColor(
                  task
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span>{task.title}</span>
                    <div className="text-sm text-gray-500">
                      {new Date(task.planDate).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setDropdownOpenId(
                        dropdownOpenId === task._id ? null : task._id
                      )
                    }
                    className="text-white bg-purple-600 hover:bg-purple-700 font-medium rounded-lg text-sm px-3 py-1.5"
                  >
                    Seçenekler
                  </button>
                </div>

                {dropdownOpenId === task._id && (
                  <div className="absolute right-0 z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                    <ul className="py-2 text-sm text-gray-700">
                      <li>
                        <button
                          onClick={() =>
                            updateTask(task._id, { completed: true })
                          }
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          ✅ Tamamla
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            updateTask(task._id, { planDate: null });
                          }}
                          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                        >
                          Planı Kaldır
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Tamamlanmış Görevler */}
        {/* Tamamlanmış Görevler */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-4 text-lg font-semibold text-green-600">
            Tamamlanmış Görevler
          </h2>

          {/* Arama Kutusu */}
          <input
            type="text"
            placeholder="Tamamlanmış görevlerde ara..."
            className="w-full p-2 mb-4 border rounded"
            value={completedSearch}
            onChange={(e) => setCompletedSearch(e.target.value)}
          />

          <ul
            className="space-y-2"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {completedTasks
              .filter((task) =>
                task.title.toLowerCase().includes(completedSearch.toLowerCase())
              )
              .map((task) => (
                <li
                  key={task._id}
                  className="p-3 text-gray-400 line-through bg-gray-100 border rounded"
                >
                  {task.title}
                </li>
              ))}

            {completedTasks.filter((task) =>
              task.title.toLowerCase().includes(completedSearch.toLowerCase())
            ).length === 0 && (
              <li className="text-gray-500">Aramaya uygun görev bulunamadı.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Planlama Modalı */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="p-6 bg-white rounded shadow w-96">
            <h3 className="mb-4 text-lg font-semibold">Görev Planla</h3>
            <p className="mb-2 text-sm text-gray-600">{selectedTask?.title}</p>
            <input
              type="date"
              className="w-full p-2 mb-4 border rounded"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:underline"
              >
                İptal
              </button>
              <button
                onClick={handlePlanSubmit}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Planla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
