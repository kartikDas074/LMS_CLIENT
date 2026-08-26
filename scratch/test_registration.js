async function testRegister(username, email, role) {
  console.log(`Testing registration for username: ${username}, role: ${role}`);
  const payload = {
    username,
    email,
    password: "Password123!",
    confirmPassword: "Password123!",
    role,
    profileImage: {
      url: "https://res.cloudinary.com/dmrkirvua/image/upload/v1724658930/avatar-sample.jpg",
      publicId: "avatar-sample-123"
    }
  };

  try {
    const res = await fetch("http://127.0.0.1:1337/api/auth/local/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Status:", res.status);
    if (!res.ok) {
      console.log("Error:", data?.error || data);
    } else {
      console.log("Success! JWT length:", data.jwt?.length);
      console.log("User:", {
        id: data.user?.id,
        username: data.user?.username,
        email: data.user?.email,
        role: data.user?.role?.type || data.user?.role,
        image: data.user?.image ? "Image attached successfully" : "No image attached"
      });
    }
  } catch (err) {
    console.error("Fetch request failed:", err.message);
  }
}

async function run() {
  const ts = Date.now();
  await testRegister(`teststudent_${ts}`, `student_${ts}@example.com`, "student");
  console.log("\n-------------------------------------------------\n");
  await testRegister(`testinstructor_${ts}`, `instructor_${ts}@example.com`, "instructor");
  console.log("\n-------------------------------------------------\n");
  await testRegister(`testmanager_${ts}`, `manager_${ts}@example.com`, "content-manager");
  console.log("\n-------------------------------------------------\n");
  await testRegister(`testadmin_${ts}`, `admin_${ts}@example.com`, "admin-pannel");
}

run();
