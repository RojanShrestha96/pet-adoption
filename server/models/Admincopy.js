const AdmincopySchema = new mongoose.Schema({
    name: { type: String, trim: true },
    username: { type: String, required: true, unique: true, trim: true })