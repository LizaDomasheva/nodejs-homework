const mongoose = require('mongoose');
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const contactSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  subscription: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
    required: true,
  },
  token: { type: String },
});

contactSchema.plugin(mongoosePaginate);

contactSchema.statics.findContactByIdAndUpdate = findContactByIdAndUpdate;
contactSchema.statics.findContactByEmail = findContactByEmail;
contactSchema.statics.updateToken = updateToken;

async function findContactByIdAndUpdate(contactId, updateParams) {
  return this.findByIdAndUpdate(
    contactId,
    {
      $set: updateParams,
    },
    {
      new: true,
    },
  );
}

async function findContactByEmail(email) {
  return this.findOne({ email });
}

async function updateToken(id, newToken) {
  return this.findByIdAndUpdate(id, {
    token: newToken,
  });
}

const contactModel = mongoose.model('Contact', contactSchema);

module.exports = contactModel;
