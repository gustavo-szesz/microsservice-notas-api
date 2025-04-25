import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    // gerenciar cache de usuários
    async getUser(usuarioId: string): Promise<any> {
        return this.cacheManager.get(usuarioId);
    }

    async setUser(userId: string, userData: any): Promise<void> {
        await this.cacheManager.set(`user:${userId}`, userData, 1800); // 30 minutos ttl
    }

    // gerenciar cache de conteúdos
    async getContent(conteudoId: string): Promise<any> {
        return this.cacheManager.get(`conteudo:${conteudoId}`);
    }

    async setContent(conteudoId: string, conteudoData: any): Promise<void> {
        await this.cacheManager.set(`conteudo:${conteudoId}`, conteudoData, 3600); // 30 minutos ttl
    }
    
    // gerenciar cache de notas

    async getGrade(gradeId: string): Promise<any> {
        return this.cacheManager.get(`grade:${gradeId}`);
    }

    async setGrade(gradeId: string, gradeData: any): Promise<void> {
        await this.cacheManager.set(`grade:${gradeId}`, gradeData, 900); // 30 minutos ttl
    }

    async invalidateGrade(gradeId: string): Promise<void> {
        await this.cacheManager.del(`grade:${gradeId}`);
    }

    // gerenciar cache de listas de notas
    async getStudentGrades(studentId: string): Promise<any> {
        return this.cacheManager.get(`grades:student${studentId}`);
    }

    async setStudentGrades(studentId: string, gradesData: any): Promise<void> {
        await this.cacheManager.set(`grades:student:${studentId}`, gradesData, 600); // 30 minutos ttl
    }

    async getContentGrades(contentId: string): Promise<any> {
        return this.cacheManager.get(`grades:content:${contentId}`);
    }

    async setContentGrades(contentId: string, gradesData: any): Promise<void> {
        await this.cacheManager.set(`grades:content:${contentId}`, gradesData, 600); // 30 minutos ttl
    }

    // Metodo para gerenciar cache de médias
    async getStudentAverage(studentId: string): Promise<any> {
        return this.cacheManager.get(`average:student:${studentId}`);
    }

    async setStudentAverage(studentId: string, averageData: any): Promise<void> {
        await this.cacheManager.set(`average:student:${studentId}`, averageData, 900); // 30 minutos ttl
    }

    async getContentAverage(contentId: string): Promise<any> {
        return this.cacheManager.get(`average:content:${contentId}`);
    }

    async setContentAverage(contentId: string, averageData: any): Promise<void> {
        await this.cacheManager.set(`average:content:${contentId}`, averageData, 900); // 30 minutos ttl
    }

    // Invalidar cache 
    async invalidateStudentCache(studentId: string): Promise<void> {
        await this.cacheManager.del(`grades:student:${studentId}`);
        await this.cacheManager.del(`average:student:${studentId}`);
    }

    async invalidateContentCache(contentId: string): Promise<void> {
        await this.cacheManager.del(`grades:content:${contentId}`);
        await this.cacheManager.del(`average:content:${contentId}`);
    }
}
