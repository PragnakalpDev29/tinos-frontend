export interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  experience: string
  availability: 'available' | 'busy' | 'offline'
  image: string
  nextAvailable?: string
}

export interface Specialty {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  date: Date
  status: 'scheduled' | 'completed' | 'cancelled'
  type: 'video' | 'phone' | 'chat'
}

export interface User {
  id: string
  email: string
  name: string
  role: 'patient' | 'doctor' | 'admin'
  avatar?: string
}
