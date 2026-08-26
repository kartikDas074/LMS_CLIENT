const BASE_URL = 'http://127.0.0.1:1337';

async function testLogin(email, password) {
  console.log(`\nTest E - Login: ${email}`);
  const res = await fetch(`${BASE_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.log('  ❌ Login failed:', data?.error?.message || data);
    return null;
  }
  console.log(`  ✅ Login OK — JWT length: ${data.jwt?.length}`);
  console.log(`  User: id=${data.user?.id}, username=${data.user?.username}, role=${data.user?.role?.type || data.user?.role}`);
  return data.jwt;
}

async function testMe(jwt) {
  console.log('\nTest F - GET /api/users/me');
  const res = await fetch(`${BASE_URL}/api/users/me?populate=image,role`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const data = await res.json();
  if (!res.ok) {
    console.log('  ❌ /users/me failed:', data?.error?.message || data);
    return;
  }
  console.log('  ✅ /users/me OK');
  console.log('  Fields:');
  console.log(`    id:            ${data.id}`);
  console.log(`    username:      ${data.username}`);
  console.log(`    email:         ${data.email}`);
  console.log(`    role.type:     ${data.role?.type ?? '⚠️  MISSING'}`);
  console.log(`    role.name:     ${data.role?.name ?? '⚠️  MISSING'}`);
  console.log(`    image:         ${data.image?.url ? `✅ ${data.image.url}` : '⚠️  No image'}`);
  console.log(`    password:      ${data.password ? '⚠️  EXPOSED (bad!)' : '✅ Hidden'}`);
  console.log(`    resetPwdToken: ${data.resetPasswordToken ? '⚠️  EXPOSED (bad!)' : '✅ Hidden'}`);
}

async function run() {
  // Use the test users created previously (latest registration run)
  const ts = '1787724868721';

  console.log('=== LMS Auth System Test ===');
  console.log('=====================================');

  // Test student login & me
  const studentJwt = await testLogin(`student_${ts}@example.com`, 'Password123!');
  if (studentJwt) await testMe(studentJwt);

  console.log('\n-------------------------------------');

  // Test instructor login & me
  const instructorJwt = await testLogin(`instructor_${ts}@example.com`, 'Password123!');
  if (instructorJwt) await testMe(instructorJwt);

  console.log('\n-------------------------------------');

  // Test content-manager login & me
  const managerJwt = await testLogin(`manager_${ts}@example.com`, 'Password123!');
  if (managerJwt) await testMe(managerJwt);

  console.log('\n-------------------------------------');

  // Test admin-pannel login & me
  const adminJwt = await testLogin(`admin_${ts}@example.com`, 'Password123!');
  if (adminJwt) await testMe(adminJwt);

  console.log('\n=====================================');
  console.log('All tests complete.');
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
