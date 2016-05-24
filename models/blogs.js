var mongoose = require('mongoose');

var blogSchema = mongoose.Schema({
    title: String,
    date: Date,
    image: String,
    text: String
});

var Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
