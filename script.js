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

  users[user] = { password: pass, tasks: {}, profileCompleted: false };
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

    if (!users[u].profileCompleted) {
      document.getElementById('edit-profile-modal').style.display = 'flex';
    } else {
      loadTasks();
    }
  } else {
    document.getElementById('login-error').textContent = 'Sai tài khoản hoặc mật khẩu';
  }
}

function logout() {
  closeEditModal();
  closeChangePasswordModal();
  currentUser = null;
  document.getElementById('auth-screen').style.display = 'block';
  document.getElementById('app-screen').style.display = 'none';
}

function addTask(event) {
  event.preventDefault();
  const content = document.getElementById('task-input').value;
  const priorityMap = { high: 3, medium: 2, low: 1 }; 
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
  const priorityTextMap = { 3: 'Cao', 2: 'Trung bình', 1: 'Thấp' }; 

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

function editProfile() {
  const modal = document.getElementById('edit-profile-modal');
  modal.style.display = 'flex';
  document.getElementById('edit-username').value = currentUser;

  const users = JSON.parse(localStorage.getItem('users'));
  const info = users[currentUser]?.info || {};

  document.getElementById('avatar-preview').src = info.avatar || '';
  document.getElementById('edit-name').value = info.name || '';
  document.getElementById('edit-dob').value = info.dob || '';
  document.getElementById('edit-email').value = info.email || '';
  document.getElementById('edit-phone').value = info.phone || '';
  document.getElementById('edit-job').value = info.job || '';
  document.getElementById('edit-workplace').value = info.workplace || '';
}

function closeEditModal() {
  document.getElementById('edit-profile-modal').style.display = 'none';
}

function saveProfile() {
  const users = JSON.parse(localStorage.getItem('users'));
  const avatar = document.getElementById('avatar-preview').src || '';
  const name = document.getElementById('edit-name').value.trim();
  const dob = document.getElementById('edit-dob').value.trim();
  const email = document.getElementById('edit-email').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  const job = document.getElementById('edit-job').value.trim();
  const workplace = document.getElementById('edit-workplace').value.trim();

  if (!name || !dob || !email || !phone || !job || !workplace) {
    alert("Vui lòng nhập đầy đủ thông tin cá nhân!");
    return;
  }

  users[currentUser].info = { name, dob, email, phone, job, workplace };
  users[currentUser].profileCompleted = true;
  
  localStorage.setItem('users', JSON.stringify(users));
  closeEditModal();
  alert('Cập nhật hồ sơ thành công!');
  loadTasks();
}

function openChangePasswordModal() {
  document.getElementById('change-password-modal').style.display = 'flex';
}

function closeChangePasswordModal() {
  document.getElementById('change-password-modal').style.display = 'none';
}

function saveNewPassword() {
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;

  if (!newPass || !confirmPass) {
    alert("Vui lòng nhập đủ thông tin");
    return;
  }

  if (newPass != confirmPass) {
    alert("Mật khẩu xác nhận không khớp");
    return;
  }

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passRegex.test(newPass)) {
    alert("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt");
    return;
  }

  const users = JSON.parse(localStorage.getItem('users'));
  users[currentUser].password = newPass;
  localStorage.setItem('users', JSON.stringify(users));

  closeChangePasswordModal();
  alert("Đổi mật khẩu thành công!");
}

document.addEventListener('DOMContentLoaded', function() {
  const avatarInput = document.getElementById("edit-avatar");
  const preview = document.getElementById("avatar-preview");

  if (avatarInput && preview) {
    avatarInput.addEventListener("change", function() {
      const file = this.file[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  document.addEventListener('click', function (event) {
    const profileModal = document.getElementById('edit-profile-modal');
    const passModal = document.getElementById('change-password-modal');

    if (event.target === profileModal) closeEditModal();
    if (event.target === passModal) closeChangePasswordModal();
  });

  const userBtn = document.getElementById("user-icon-btn");
  const dropdown = document.getElementById("user-dropdown");
  if (userBtn && dropdown) {
    userBtn.addEventListener("click", function() {
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function(event) {
      if (!userBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = "none";
      }
    });
  }
});