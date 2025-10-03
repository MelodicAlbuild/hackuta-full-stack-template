"use client";

import { useState, useEffect } from "react";

// Types
interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  categoryId?: number;
  category?: Category;
  tags: { tag: Tag }[];
  createdAt: string;
}

interface Stats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
  totalCategories: number;
  totalTags: number;
}

const API_URL = "http://localhost:3001/api";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    categoryId: "",
    tagIds: [] as number[],
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#3b82f6",
  });
  const [newTag, setNewTag] = useState({ name: "", color: "#10b981" });

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // View states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [tasksRes, categoriesRes, tagsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/tasks`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/tags`),
        fetch(`${API_URL}/stats`),
      ]);

      setTasks(await tasksRes.json());
      setCategories(await categoriesRes.json());
      setTags(await tagsRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Task operations
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
          categoryId: newTask.categoryId ? parseInt(newTask.categoryId) : null,
          tagIds: newTask.tagIds,
        }),
      });

      if (response.ok) {
        setNewTask({ title: "", description: "", categoryId: "", tagIds: [] });
        await fetchAll();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const toggleTask = async (id: number) => {
    try {
      await fetch(`${API_URL}/tasks/${id}/toggle`, { method: "PATCH" });
      await fetchAll();
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
      await fetchAll();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Category operations
  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        setNewCategory({ name: "", color: "#3b82f6" });
        setShowCategoryForm(false);
        await fetchAll();
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  // Tag operations
  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTag),
      });

      if (response.ok) {
        setNewTag({ name: "", color: "#10b981" });
        setShowTagForm(false);
        await fetchAll();
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  // Toggle tag selection
  const toggleTagSelection = (tagId: number) => {
    setNewTask((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !filterCategory || task.categoryId === parseInt(filterCategory);
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !task.completed) ||
      (filterStatus === "completed" && task.completed);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Task Management
          </h1>
          <p className="text-slate-300">Organize your work with style ✨</p>
        </header>

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="liquid-card text-center">
              <div className="text-3xl font-bold text-blue-400">
                {stats.totalTasks}
              </div>
              <div className="text-sm text-slate-400">Total Tasks</div>
            </div>
            <div className="liquid-card text-center">
              <div className="text-3xl font-bold text-green-400">
                {stats.completedTasks}
              </div>
              <div className="text-sm text-slate-400">Completed</div>
            </div>
            <div className="liquid-card text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {stats.activeTasks}
              </div>
              <div className="text-sm text-slate-400">Active</div>
            </div>
            <div className="liquid-card text-center">
              <div className="text-3xl font-bold text-purple-400">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-slate-400">Progress</div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Task Creation & Filters */}
          <div className="space-y-6">
            {/* Create Task Form */}
            <div className="liquid-card">
              <h2 className="text-xl font-bold mb-4">Create Task</h2>
              <form onSubmit={createTask} className="space-y-3">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="liquid-input w-full"
                />
                <textarea
                  placeholder="Description (optional)..."
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="liquid-input w-full resize-none"
                  rows={3}
                />
                <select
                  value={newTask.categoryId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, categoryId: e.target.value })
                  }
                  className="liquid-input w-full"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Tag Selection */}
                {tags.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Tags:</div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTagSelection(tag.id)}
                          className="tag-badge"
                          style={{
                            backgroundColor: newTask.tagIds.includes(tag.id)
                              ? tag.color + "40"
                              : tag.color + "20",
                            borderColor: tag.color + "60",
                            border: "1px solid",
                          }}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="liquid-button-success w-full">
                  ➕ Add Task
                </button>
              </form>
            </div>

            {/* Filters */}
            <div className="liquid-card">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="liquid-input w-full"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="liquid-input w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="liquid-input w-full"
                >
                  <option value="all">All Tasks</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Categories Management */}
            <div className="liquid-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Categories</h2>
                <button
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="text-sm liquid-button"
                >
                  {showCategoryForm ? "Cancel" : "+ New"}
                </button>
              </div>

              {showCategoryForm && (
                <form onSubmit={createCategory} className="mb-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Category name..."
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="liquid-input w-full"
                  />
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="w-full h-10 rounded cursor-pointer"
                  />
                  <button
                    type="submit"
                    className="liquid-button-success w-full"
                  >
                    Create Category
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="category-badge"
                    style={{
                      backgroundColor: cat.color + "30",
                      borderColor: cat.color,
                      border: "1px solid",
                    }}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Management */}
            <div className="liquid-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tags</h2>
                <button
                  onClick={() => setShowTagForm(!showTagForm)}
                  className="text-sm liquid-button"
                >
                  {showTagForm ? "Cancel" : "+ New"}
                </button>
              </div>

              {showTagForm && (
                <form onSubmit={createTag} className="mb-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Tag name..."
                    value={newTag.name}
                    onChange={(e) =>
                      setNewTag({ ...newTag, name: e.target.value })
                    }
                    className="liquid-input w-full"
                  />
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) =>
                      setNewTag({ ...newTag, color: e.target.value })
                    }
                    className="w-full h-10 rounded cursor-pointer"
                  />
                  <button
                    type="submit"
                    className="liquid-button-success w-full"
                  >
                    Create Tag
                  </button>
                </form>
              )}

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="tag-badge"
                    style={{
                      backgroundColor: tag.color + "30",
                      borderColor: tag.color,
                      border: "1px solid",
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Task List */}
          <div className="lg:col-span-2">
            <div className="liquid-card">
              <h2 className="text-2xl font-bold mb-6">
                Tasks ({filteredTasks.length})
              </h2>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-6xl mb-4">📝</div>
                  <p>No tasks found. Create one to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="liquid-card flex items-start gap-4 hover:scale-[1.01] transition-transform"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 w-5 h-5 cursor-pointer"
                      />

                      <div className="flex-1">
                        <h3
                          className={`text-lg font-semibold mb-1 ${
                            task.completed ? "task-completed" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-slate-400 mb-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 items-center">
                          {task.category && (
                            <span
                              className="category-badge text-xs"
                              style={{
                                backgroundColor: task.category.color + "30",
                                borderColor: task.category.color,
                                border: "1px solid",
                              }}
                            >
                              🗂️ {task.category.name}
                            </span>
                          )}
                          {task.tags.map((taskTag) => (
                            <span
                              key={taskTag.tag.id}
                              className="tag-badge"
                              style={{
                                backgroundColor: taskTag.tag.color + "30",
                                borderColor: taskTag.tag.color,
                                border: "1px solid",
                              }}
                            >
                              {taskTag.tag.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="liquid-button-danger text-sm px-3 py-1"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
