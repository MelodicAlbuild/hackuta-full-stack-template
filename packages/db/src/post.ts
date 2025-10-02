import prisma from './client.js';

export async function createPost(title: string, content: string | null, authorId?: number) {
    return prisma.post.create({ data: { title, content, authorId } });
}

export async function getPostById(id: number) {
    return prisma.post.findUnique({ where: { id } });
}

export async function listPosts() {
    return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

export async function publishPost(id: number) {
    return prisma.post.update({ where: { id }, data: { published: true } });
}

export async function updatePost(id: number, data: { title?: string; content?: string | null }) {
    return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: number) {
    return prisma.post.delete({ where: { id } });
}
