let currentUser = null;

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

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passRegex.test(pass)) {
    document.getElementById('login-error').textContent =
      'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt';
    return;
  }

  if (pass !== confirm) {
    document.getElementById('login-error').textContent = 'Mật khẩu nhập lại không khớp';
    return;
  }

  users[user] = { password: pass, tasks: {} };
  localStorage.setItem('users', JSON.stringify(users));
  document.getElementById('login-error').textContent = 'Đăng ký thành công, bạn có thể đăng nhập';
  toggleAuth('login');
}

function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[u] && users[u].password === p) {
    currentUser = u;
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    loadTasks();
  } else {
    document.getElementById('login-error').textContent = 'Sai tài khoản hoặc mật khẩu';
  }
}

function logout() {
  currentUser = null;
  document.getElementById('auth-screen').style.display = 'block';
  document.getElementById('app-screen').style.display = 'none';
}

function addTask(event) {
  event.preventDefault();
  const content = document.getElementById('task-input').value;
  const priorityMap = { high: 3, medium: 2, low: 1 }; // Map mức độ ưu tiên
  const priority = priorityMap[document.getElementById('priority-select').value]; // Chuyển đổi sang số
  const taskDate = document.getElementById('task-date').value;

  if (!taskDate) {
    alert("Vui lòng chọn ngày");
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
  
  if (!taskDate) {
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (!users[currentUser]) {
    console.log("Không tìm thấy dữ liệu người dùng");
    return;
  }

  const tasks = users[currentUser]?.tasks?.[taskDate] || [];

  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<li>Không có công việc cho ngày này.</li>';
    return;
  }

  tasks.sort((a, b) => b.priority - a.priority);

  const priorityTextMap = { 3: 'Cao', 2: 'Trung bình', 1: 'Thấp' }; // Map mức độ ưu tiên sang chuỗi

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.priority === 3 ? 'high' : task.priority === 2 ? 'medium' : 'low';
    if (task.completed) li.classList.add('completed');
  
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleTaskCompleted(taskDate, index);
    li.appendChild(checkbox);
  
    const text = document.createTextNode(` ${task.content} (Ưu tiên ${priorityTextMap[task.priority]})`);
    li.appendChild(text);
  
    const btn = document.createElement('button');
    btn.textContent = 'Xoá';
    btn.className = 'delete-btn';
    btn.onclick = () => {
      users[currentUser].tasks[taskDate].splice(index, 1);
      localStorage.setItem('users', JSON.stringify(users));
      loadTasks();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}
