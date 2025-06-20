class BaseUser {
  constructor({
    id,
    firstName,
    lastName,
    phoneNumber,
    email,
    birthDate,
    passwordHash,
    profilePicture = null,
    location = null,
    lastLoginDate = new Date(),
    status = 'active',
    role = 'freemium',
    isActive = true,
    suggestionCountToday,
    lastSuggestionDate,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.birthDate = new Date(birthDate);
    this.passwordHash = passwordHash;
    this.profilePicture = profilePicture;
    this.location = location;
    this.lastLoginDate = new Date(lastLoginDate);
    this.status = status;
    this.role = role;
    this.isActive = isActive;
    this.suggestionCountToday = suggestionCountToday;
    this.lastSuggestionDate = lastSuggestionDate; 
    this.createdAt = new Date(createdAt);
  }

  // Getters
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  getAge() {
    const now = new Date();
    const age = now.getFullYear() - this.birthDate.getFullYear();
    const m = now.getMonth() - this.birthDate.getMonth();
    return m < 0 || (m === 0 && now.getDate() < this.birthDate.getDate()) ? age - 1 : age;
  }

  getEmail() {
    return this.email;
  }

  getRole() {
    return this.role;
  }

  getStatus() {
    return this.status;
  }

  // Setters
  setProfilePicture(url) {
    this.profilePicture = url;
  }

  setLocation(location) {
    this.location = location;
  }

  setStatus(status) {
    this.status = status;
  }

  setRole(role) {
    this.role = role;
  }

  setLastLoginDate(date = new Date()) {
    this.lastLoginDate = new Date(date);
  }

  setIsActive(isActive) {
    this.isActive = isActive;
  }

  updateLastLogin() {
    this.lastLoginDate = new Date();
  }

  deactivate() {
    this.status = 'inactive';
    this.isActive = false;
  }

  toJSON() {
    const {
      passwordHash, // Exclude password hash
      ...safeData
    } = this;
    return safeData;
  }
}

module.exports= BaseUser;