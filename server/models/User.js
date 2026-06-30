import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, default: "" },
    passwordSalt: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    acceptsMarketing: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    confirmationToken: { type: String, default: "" },
    confirmationSentAt: { type: Date },
    favorites: { type: [String], default: [] },
    purchases: { type: [mongoose.Schema.Types.ObjectId], ref: "Order", default: [] },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.passwordHash;
    delete returnedObject.passwordSalt;
    delete returnedObject.confirmationToken;
    delete returnedObject.confirmationSentAt;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
