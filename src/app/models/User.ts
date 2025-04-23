export default class User {
    id: number
    email: string
    username: string
    role: string
    createdDate: Date

    constructor(id: number, email: string, firstName: string, lastName: string, username: string, role: string, createdDate: Date) { 
        this.id = id
        this.email = email
        this.username = username
        this.role = role
        this.createdDate = createdDate
    }
}