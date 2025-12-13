const ApiError = require("../api-error");
const userService = require("../services/users.service");
const bcrypt = require("bcrypt");
const JSend = require("../jsend");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

async function registerUser(req, res, next) {
  const { username, email, password } = req.body || {};
  console.log("Dữ liệu nhận được từ client:", req.body);
  if (!username || !email || !password) {
    return res
      .status(400)
      .json(JSend.fail("Thiếu thông tin username, email hoặc password"));
  }
  try {
    const existingUser = await userService.existingUser(username, email);
    if (existingUser) {
      return res
        .status(400)
        .json(JSend.fail("Tên đăng nhập hoặc email đã tồn tại"));
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userData = {
      username,
      email,
      password: hashedPassword,
      created_at: new Date(),
    };
    const result = await userService.registerUser(userData);
    return res.status(201).json(JSend.success(result.message));
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng:", error.message);
    return next(new ApiError(500, "Lỗi đăng ký người dùng"));
  }
}
async function adminFindUser(req, res, next) {
  // Quyền đã được kiểm tra bởi authorize("users","read") ở router
  const { username, email } = req.query || {};

  try {
    const users = await userService.findByUsernameOrEmail(username, email);

    if (!users || users.length === 0) {
      return res.status(404).json(JSend.fail("Không tìm thấy người dùng"));
    }

    const sanitizedUsers = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    return res.status(200).json(JSend.success(sanitizedUsers));
  } catch (error) {
    console.error("Lỗi khi tìm người dùng:", error.message);
    return next(new ApiError(500, "Lỗi tìm kiếm người dùng"));
  }
}

async function loginUser(req, res, next) {
  const { username, password, role } = req.body || {};
  console.log("loginData:", req.body, "JWT_SECRET:", process.env.JWT_SECRET);

  if (!username || !password) {
    return res
      .status(400)
      .json(JSend.fail("Thiếu thông tin username hoặc password"));
  }

  try {
    const user = await userService.existingUser(username, null);

    if (!user) {
      return res
        .status(401)
        .json(JSend.fail("Sai tên đăng nhập hoặc mật khẩu"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json(JSend.fail("Sai tên đăng nhập hoặc mật khẩu"));
    }

    const payload = {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });
    console.log("Login successfull:", "username:", username, "Role:", user.role);
    return res.status(200).json(
      JSend.success({
        message: "Đăng nhập thành công",
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
        },
      })
    );
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    return next(new ApiError(500, "Lỗi đăng nhập"));
  }
}

async function userGetInfor(req, res, next) {
  try {
    const user = await userService.findByUsernameOrEmail(
      req.user.username,
      null
    );

    if (!user) {
      return res
        .status(404)
        .json(JSend.fail("Không tìm thấy thông tin người dùng"));
    }
    delete user.password;

    return res.status(200).json(JSend.success(user));
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error.message);
    return next(new ApiError(500, "Lỗi lấy thông tin người dùng"));
  }
}

async function updateUserInfor(req, res, next) {
  const { email, phone, address, avatar } = req.body || {};

  const updateData = {};
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;
  if (avatar) updateData.avatar = avatar;

  try {
    const updated = await userService.updateUserInfor(
      req.user.user_id,
      updateData
    );
    if (updated === 0) {
      return res.status(404).json(JSend.fail("Không tìm thấy người dùng"));
    }
    return res.status(200).json(JSend.success("Cập nhật thông tin thành công"));
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error.message);
    return next(new ApiError(500, "Lỗi khi cập nhật thông tin người dùng"));
  }
}

async function changePassword(req, res, next) {
  const { oldPassword, newPassword, targetUsername } = req.body || {};

  if (!newPassword) {
    return res.status(400).json(JSend.fail("Thiếu mật khẩu mới"));
  }

  if (oldPassword && targetUsername) {
    return res.status(400).json(JSend.fail("Yêu cầu không hợp lệ"));
  }

  try {
    if (targetUsername && targetUsername !== req.user.username) {
      const [targetUser] = await userService.findByUsernameOrEmail(targetUsername, null);

      if (!targetUser) {
        return res.status(404).json(JSend.fail("Không tìm thấy người dùng cần reset mật khẩu"));
      }

      const isSameAsOld = await bcrypt.compare(newPassword, targetUser.password);
      if (isSameAsOld) {
        return res.status(400).json(JSend.fail("Mật khẩu mới không được trùng với mật khẩu hiện tại"));
      }

      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await userService.updateUserInfor(targetUser.user_id, { password: hashedPassword });

      return res.status(200).json(JSend.success("Đã reset mật khẩu thành công"));
    }


    if (!oldPassword) {
      return res.status(400).json(JSend.fail("Thiếu mật khẩu cũ"));
    }

    const [user] = await userService.findByUsernameOrEmail(req.user.username, null);

    if (!user) {
      return res.status(404).json(JSend.fail("Không tìm thấy thông tin người dùng"));
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json(JSend.fail("Mật khẩu cũ không chính xác"));
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json(JSend.fail("Mật khẩu mới không được trùng với mật khẩu cũ"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await userService.updateUserInfor(user.user_id, { password: hashedPassword });

    return res.status(200).json(JSend.success("Đổi mật khẩu thành công"));
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error.message);
    return next(new ApiError(500, "Lỗi khi đổi mật khẩu"));
  }
}

async function adminGetAllUsers(req, res, next) {
 try {
    // Quyền đã được kiểm tra bởi authorize("users","read") ở router
    const users = await userService.getAllUsers();
    return res.json(JSend.success(users));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return res.status(500).json(JSend.error("Lỗi máy chủ"));
  }
}

async function adminUpdateUser(req, res, next) {
  try {
    const username = req.params.username;
    if (!username) return res.status(400).json(JSend.fail("Thiếu username"));

    const { email, phone, address, avatar, role } = req.body || {};
    const updateData = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (avatar) updateData.avatar = avatar;
    if (role) updateData.role = role;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json(JSend.fail("Không có dữ liệu để cập nhật"));
    }

    const updated = await userService.updateUserByUsername(username, updateData);
    if (!updated) return res.status(404).json(JSend.fail("Không tìm thấy người dùng"));

    return res.status(200).json(JSend.success("Cập nhật người dùng thành công"));
  } catch (error) {
    console.error("Lỗi adminUpdateUser:", error.message);
    return next(new ApiError(500, "Lỗi cập nhật người dùng"));
  }
}

async function adminCreateUser(req, res, next) {
  const { username, email, password, role, phone, address, avatar } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json(JSend.fail("Missing username, email or password"));
  }
  try {
    const existing = await userService.existingUser(username, email);
    if (existing) {
      return res.status(400).json(JSend.fail("Username or email already exists"));
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userData = {
      username,
      email,
      password: hashedPassword,
      created_at: new Date(),
    };
    await userService.registerUser(userData);

    // Fetch the created user
    const createdArr = await userService.findByUsernameOrEmail(username, email);
    const created = Array.isArray(createdArr) ? createdArr[0] : createdArr;
    if (!created) {
      return res.status(500).json(JSend.error("Failed to create user"));
    }

    // Optional: update profile/role after creation
    const updateData = {};
    if (role) updateData.role = role;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (avatar) updateData.avatar = avatar;
    if (Object.keys(updateData).length > 0) {
      await userService.updateUserByUsername(username, updateData);
      // refresh created info (best-effort)
      const updatedArr = await userService.findByUsernameOrEmail(username, email);
      if (Array.isArray(updatedArr) && updatedArr[0]) {
        created.username = updatedArr[0].username;
        created.email = updatedArr[0].email;
        created.role = updatedArr[0].role;
        created.phone = updatedArr[0].phone;
        created.address = updatedArr[0].address;
        created.avatar = updatedArr[0].avatar;
      }
    }

    return res.status(201).json(JSend.success({ user: created }));
  } catch (error) {
    console.error("Admin create user error:", error);
    return next(new ApiError(500, "Failed to create user"));
  }
}

module.exports = {
  registerUser,
  loginUser,
  updateUserInfor,
  adminFindUser,
  userGetInfor,
  changePassword,
  adminGetAllUsers,
  adminUpdateUser,
  adminCreateUser,
};
