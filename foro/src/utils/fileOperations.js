import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// File paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
// Generic file read function
const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]');
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return [];
    }
};
// Generic file write function
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
    }
};
// User operations
export const getUsers = () => readJsonFile(USERS_FILE);
export const addUser = async (user) => {
    try {
        const users = getUsers();
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = {
            ...user,
            password: hashedPassword,
            favorites: [] // Initialize empty favorites array
        };
        users.push(newUser);
        writeJsonFile(USERS_FILE, users);
        return true;
    }
    catch (error) {
        console.error('Error adding user:', error);
        return false;
    }
};
export const validateUser = async (username, password) => {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user)
        return false;
    return await bcrypt.compare(password, user.password);
};
export const toggleUserFavorite = (username, postId) => {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1)
            return false;
        const user = users[userIndex];
        const favoriteIndex = user.favorites.indexOf(postId);
        if (favoriteIndex === -1) {
            user.favorites.push(postId);
        }
        else {
            user.favorites.splice(favoriteIndex, 1);
        }
        writeJsonFile(USERS_FILE, users);
        return true;
    }
    catch (error) {
        console.error('Error toggling user favorite:', error);
        return false;
    }
};
export const getUserFavorites = (username) => {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    return user?.favorites || [];
};
// Post operations
export const getPosts = () => readJsonFile(POSTS_FILE);
export const addPost = (post) => {
    const posts = getPosts();
    const newPost = {
        ...post,
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1
    };
    posts.push(newPost);
    writeJsonFile(POSTS_FILE, posts);
    return newPost;
};
export const updatePost = (post) => {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index === -1)
        return false;
    posts[index] = post;
    writeJsonFile(POSTS_FILE, posts);
    return true;
};
// Comment operations
export const getComments = () => readJsonFile(COMMENTS_FILE);
export const getCommentsByPostId = (postId) => {
    const comments = getComments();
    return comments.filter(comment => comment.postId === postId);
};
export const addComment = (comment) => {
    const comments = getComments();
    const newComment = {
        ...comment,
        id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1
    };
    comments.push(newComment);
    writeJsonFile(COMMENTS_FILE, comments);
    // Update comment count in post
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === comment.postId);
    if (postIndex !== -1) {
        posts[postIndex].comments += 1;
        writeJsonFile(POSTS_FILE, posts);
    }
    return newComment;
};
