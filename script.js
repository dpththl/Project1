let currentUser = localStorage.getItem('currentUser') || null;

function toggleAuth(mode) {
  document.getElementById('login-screen').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('register-screen').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('login-error').textContent = '';
}

function register() {
  const user = document.getElementById('new-username').value.trim();
  const pass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[user]) {
    document.getElementById('login-error').textContent = 'Tài khoản đã tồn tại';
    return;
  }

  if (user.length < 3) {
    document.getElementById('login-error').textContent = 'Tên tài khoản phải từ 3 ký tự trở lên';
    return;
  }

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!passRegex.test(pass)) {
    document.getElementById('login-error').textContent = 'Mật khẩu cần ít nhất 8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt';
    return;
  }

  if (pass !== confirm) {
    document.getElementById('login-error').textContent = 'Mật khẩu nhập lại không khớp';
    return;
  }

  users[user] = { password: pass, tasks: {} };
  localStorage.setItem('users', JSON.stringify(users));
  document.getElementById('login-error').textContent = 'Đăng ký thành công, hãy đăng nhập';
  toggleAuth('login');
}

function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[u] && users[u].password === p) {
    currentUser = u;
    localStorage.setItem('currentUser', currentUser);
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    if (document.getElementById('task-date')) loadTasks();
  } else {
    document.getElementById('login-error').textContent = 'Sai tài khoản hoặc mật khẩu';
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app-screen').style.display = 'none';
}

function addTask(event) {
  event.preventDefault();
  const content = document.getElementById('task-input').value.trim();
  const priorityMap = { high: 3, medium: 2, low: 1 };
  const priority = priorityMap[document.getElementById('priority-select').value];
  const taskDate = document.getElementById('task-date').value;

  if (!taskDate || !content) {
    alert("Vui lòng nhập đầy đủ ngày và nội dung công việc");
    return;
  }

  const users = JSON.parse(localStorage.getItem('users'));
  if (!users[currentUser].tasks[taskDate]) {
    users[currentUser].tasks[taskDate] = [];
  }

  users[currentUser].tasks[taskDate].push({ content, priority, completed: false });
  localStorage.setItem('users', JSON.stringify(users));
  document.getElementById('task-input').value = '';
  loadTasks();
}

function toggleTaskCompleted(date, index) {
  const users = JSON.parse(localStorage.getItem('users'));
  users[currentUser].tasks[date][index].completed = !users[currentUser].tasks[date][index].completed;
  localStorage.setItem('users', JSON.stringify(users));
  loadTasks();
}

function loadTasks() {
  const taskDate = document.getElementById('task-date').value;
  const users = JSON.parse(localStorage.getItem('users')) || {};
  const tasks = users[currentUser]?.tasks?.[taskDate] || [];
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<li>Không có công việc cho ngày này.</li>';
    return;
  }

  const priorityTextMap = { 3: 'Cao', 2: 'Trung bình', 1: 'Thấp' };

  tasks
    .map((task, i) => ({ ...task, i }))
    .sort((a, b) => b.priority - a.priority)
    .forEach(task => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = `${task.content} (Ưu tiên: ${priorityTextMap[task.priority]})`;
      if (task.completed) span.classList.add('completed-text');

      const icons = document.createElement('div');
      icons.className = 'task-icons';

      const checkbox = document.createElement('i');
      checkbox.className = task.completed ? 'fa-regular fa-square-check' : 'fa-regular fa-square';
      checkbox.onclick = () => toggleTaskCompleted(taskDate, task.i);
      icons.appendChild(checkbox);

      const trash = document.createElement('i');
      trash.className = 'fa-solid fa-trash';
      trash.onclick = () => {
        users[currentUser].tasks[taskDate].splice(task.i, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadTasks();
      };
      icons.appendChild(trash);

      li.appendChild(span);
      li.appendChild(icons);
      list.appendChild(li);
    });
}

function showAllTasks() {
  const container = document.getElementById("all-tasks-list");
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (!currentUser || !users[currentUser]?.tasks) {
    container.innerHTML = "<p>Không có công việc nào.</p>";
    return;
  }

  const allTasks = users[currentUser].tasks;
  const sortedDates = Object.keys(allTasks).sort();
  const priorityTextMap = { 3: 'Cao', 2: 'Trung bình', 1: 'Thấp' };
  container.innerHTML = '';

  sortedDates.forEach(date => {
    const tasks = [...allTasks[date]].sort((a, b) => b.priority - a.priority);

    const section = document.createElement("div");
    section.innerHTML = `<h3>Ngày ${date}</h3>`;
    const ul = document.createElement("ul");

    tasks.forEach((task, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = `${task.content} (Ưu tiên: ${priorityTextMap[task.priority]})`;
      if (task.completed) span.classList.add("completed-text");

      const icons = document.createElement("div");
      icons.className = "task-icons";

      const checkbox = document.createElement("i");
      checkbox.className = task.completed ? "fa-regular fa-square-check" : "fa-regular fa-square";
      checkbox.onclick = () => {
        task.completed = !task.completed;
        localStorage.setItem('users', JSON.stringify(users));
        showAllTasks();
      };

      const trash = document.createElement("i");
      trash.className = "fa-solid fa-trash";
      trash.onclick = () => {
        allTasks[date].splice(i, 1);
        if (allTasks[date].length === 0) delete allTasks[date];
        localStorage.setItem('users', JSON.stringify(users));
        showAllTasks();
      };

      icons.appendChild(checkbox);
      icons.appendChild(trash);

      li.appendChild(span);
      li.appendChild(icons);
      ul.appendChild(li);
    });

    section.appendChild(ul);
    container.appendChild(section);
  });
}

// 🔁 Tự động khôi phục trạng thái nếu người dùng đã đăng nhập trước đó
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (saved && users[saved]) {
    currentUser = saved;
    // Luôn ẩn auth, hiện app
    if (document.getElementById("auth-screen")) {
      document.getElementById("auth-screen").style.display = "none";
    }
    if (document.getElementById("app-screen")) {
      document.getElementById("app-screen").style.display = "block";
    }
    if (document.getElementById("task-date")) loadTasks();
    if (document.getElementById("all-tasks-list")) showAllTasks();
  } else {
    // Nếu chưa đăng nhập, luôn hiện auth, ẩn app
    if (document.getElementById("auth-screen")) {
      document.getElementById("auth-screen").style.display = "flex";
    }
    if (document.getElementById("app-screen")) {
      document.getElementById("app-screen").style.display = "none";
    }
  }

  const dateInput = document.getElementById("task-date");
  if (dateInput) {
    dateInput.addEventListener("change", loadTasks);
  }
});
