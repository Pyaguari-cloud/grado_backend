import bcrypt from 'bcryptjs'

const testPassword = async () => {
  const plainPassword = 'admin123'
  
  // Hash the password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(plainPassword, salt)
  
  console.log('Plain password:', plainPassword)
  console.log('Hashed password:', hashedPassword)
  
  // Test comparison
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
  console.log('Passwords match:', isMatch)
  
  // Test with wrong password
  const wrongMatch = await bcrypt.compare('wrong123', hashedPassword)
  console.log('Wrong password match:', wrongMatch)
}

testPassword()