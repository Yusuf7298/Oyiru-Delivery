export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  phoneNumber: (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  minLength: (str: string, min: number): boolean => {
    return str.trim().length >= min
  },

  maxLength: (str: string, max: number): boolean => {
    return str.trim().length <= max
  },

  required: (str: string): boolean => {
    return str.trim().length > 0
  },

  zipCode: (code: string): boolean => {
    const zipRegex = /^[0-9]{5}(-[0-9]{4})?$/
    return zipRegex.test(code)
  },
}

export const validateCheckoutForm = (data: {
  deliveryAddress: string
  deliveryCity: string
  phoneNumber: string
}): ValidationResult => {
  const errors: ValidationError[] = []

  if (!validators.required(data.deliveryAddress)) {
    errors.push({
      field: 'deliveryAddress',
      message: 'Delivery address is required',
    })
  }

  if (!validators.required(data.deliveryCity)) {
    errors.push({
      field: 'deliveryCity',
      message: 'City is required',
    })
  }

  if (!validators.required(data.phoneNumber)) {
    errors.push({
      field: 'phoneNumber',
      message: 'Phone number is required',
    })
  } else if (!validators.phoneNumber(data.phoneNumber)) {
    errors.push({
      field: 'phoneNumber',
      message: 'Please enter a valid phone number',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateSignUp = (data: {
  email: string
  password: string
  confirmPassword: string
  name: string
}): ValidationResult => {
  const errors: ValidationError[] = []

  if (!validators.required(data.name)) {
    errors.push({
      field: 'name',
      message: 'Name is required',
    })
  }

  if (!validators.required(data.email)) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    })
  } else if (!validators.email(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email',
    })
  }

  if (!validators.required(data.password)) {
    errors.push({
      field: 'password',
      message: 'Password is required',
    })
  } else if (!validators.minLength(data.password, 8)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters',
    })
  }

  if (data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateProfileForm = (data: {
  phoneNumber?: string
  address?: string
  city?: string
  zipCode?: string
}): ValidationResult => {
  const errors: ValidationError[] = []

  if (data.phoneNumber && !validators.phoneNumber(data.phoneNumber)) {
    errors.push({
      field: 'phoneNumber',
      message: 'Please enter a valid phone number',
    })
  }

  if (data.zipCode && !validators.zipCode(data.zipCode)) {
    errors.push({
      field: 'zipCode',
      message: 'Please enter a valid zip code',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
