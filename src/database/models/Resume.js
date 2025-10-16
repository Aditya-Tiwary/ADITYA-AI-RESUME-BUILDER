const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' }
});

const educationSchema = new mongoose.Schema({
  degree: { type: String, default: '' },
  institution: { type: String, default: '' },
  location: { type: String, default: '' },
  duration: { type: String, default: '' }
});

const skillsSchema = new mongoose.Schema({
  technical: [{ 
    category: { type: String, default: '' },
    items: [{ type: String, default: '' }]
  }]
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  
  summary: { type: String, default: '' },
  
  experience: [experienceSchema],
  
  education: [educationSchema],
  
  skills: skillsSchema,
  
  achievements: [{
    keyAchievements: { type: String, default: '' },
    describe: { type: String, default: '' }
  }],
  
  languages: [{ type: String, default: '' }],
  
  template: {
    type: String,
    enum: ['template1', 'template2', 'template3'],
    default: 'template1'
  },
  theme: {
    type: String,
    enum: ['blue', 'red', 'green', 'purple', 'orange', 'teal', 'gray'],
    default: 'blue'
  },
  
  title: { type: String, default: 'My Resume' },
  lastModified: { type: Date, default: Date.now },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

resumeSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);