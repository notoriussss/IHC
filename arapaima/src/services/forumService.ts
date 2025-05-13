import forumData from '@/data/forumData.json';

// Definición de tipos
export interface Comment {
    id: number;
    author: string;
    content: string;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    replies?: Comment[];
}

export interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    comments: Comment[];
}

export interface ForumData {
    recentTopics: {
        id: number;
        title: string;
        comments: number;
    }[];
    posts: Post[];
}

// Evento personalizado para cambios en el foro
const FORUM_CHANGE_EVENT = 'forumDataChange';
const forumEventEmitter = new EventTarget();

// Tipo personalizado para el evento del foro
interface ForumChangeEvent extends CustomEvent<ForumData> {
    detail: ForumData;
}

// Función para actualizar los contadores de comentarios
function updateCommentCounts(data: ForumData): ForumData {
    const updatedRecentTopics = data.recentTopics.map(topic => {
        const relatedPost = data.posts.find(post => post.id === topic.id);
        if (relatedPost) {
            const totalComments = relatedPost.comments.reduce((total, comment) => 
                total + 1 + (comment.replies?.length || 0), 0);
            return { ...topic, comments: totalComments };
        }
        return topic;
    });

    return {
        ...data,
        recentTopics: updatedRecentTopics
    };
}

// Datos en memoria
let currentData: ForumData;

// Inicializar con datos del localStorage si existen, sino usar el JSON
const savedData = localStorage.getItem('forumData');
if (savedData) {
    try {
        currentData = JSON.parse(savedData);
    } catch (error) {
        console.error('Error al cargar datos guardados:', error);
        currentData = { ...forumData };
    }
} else {
    currentData = { ...forumData };
}

// Asegurarse de que los contadores estén actualizados
currentData = updateCommentCounts(currentData);

// Función para obtener los datos actuales
export function getForumData(): ForumData {
    return currentData;
}

// Función para actualizar los datos
export function updateForumData(newData: ForumData): boolean {
    // Actualizar los contadores de comentarios antes de guardar
    const updatedData = updateCommentCounts(newData);
    currentData = updatedData;
    
    // Disparar evento de cambio
    const event = new CustomEvent<ForumData>(FORUM_CHANGE_EVENT, { detail: currentData });
    forumEventEmitter.dispatchEvent(event);
    
    // Guardar en localStorage como respaldo
    localStorage.setItem('forumData', JSON.stringify(currentData));
    
    return true;
}

// Función para suscribirse a cambios
export function subscribeToForumChanges(callback: (data: ForumData) => void) {
    const handler = (event: Event) => {
        if (event instanceof CustomEvent) {
            const forumEvent = event as ForumChangeEvent;
            callback(forumEvent.detail);
        }
    };
    
    forumEventEmitter.addEventListener(FORUM_CHANGE_EVENT, handler);
    return () => forumEventEmitter.removeEventListener(FORUM_CHANGE_EVENT, handler);
} 