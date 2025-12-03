'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlogService, { BlogPost } from '@/app/services/blogService';
import Breadcrumb from '@/app/components/breadcrumb';
import Banner from '@/app/img/banner-blog.jpeg';
import { Calendar, Clock, Eye, User, ArrowLeft } from 'lucide-react';

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await BlogService.getPostBySlug(slug);
                setPost(data);
            } catch (err: any) {
                console.error('Erro ao buscar post:', err);
                setError('Post não encontrado.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    if (loading) {
        return (
            <div>
                <Breadcrumb image={Banner} title="Carregando..." page="Blog" />
                <div className="container mx-auto p-4 md:p-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                        <div className="h-64 bg-gray-200 rounded mb-8"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div>
                <Breadcrumb image={Banner} title="Erro" page="Blog" />
                <div className="container mx-auto p-4 md:p-8">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
                        <p className="font-bold">Post não encontrado</p>
                        <p className="text-sm mt-2">{error || 'O artigo que você procura não existe.'}</p>
                        <button
                            onClick={() => router.push('/pages/blog')}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Voltar ao Blog
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Data não disponível';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'nutrition': 'Nutrição',
            'recipes': 'Receitas',
            'tips': 'Dicas',
            'diseases': 'Doenças',
            'supplements': 'Suplementos',
            'weight_loss': 'Emagrecimento',
            'sports_nutrition': 'Nutrição Esportiva',
            'child_nutrition': 'Nutrição Infantil',
            'elderly_nutrition': 'Nutrição para Idosos',
            'vegetarian': 'Vegetariano/Vegano',
            'functional_food': 'Alimentos Funcionais',
            'food_safety': 'Segurança Alimentar'
        };
        return labels[category] || category;
    };

    return (
        <div>
            <Breadcrumb image={Banner} title={post.title} page="Blog" />
            
            <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
                {/* Botão Voltar */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-petroleumGreen hover:text-mintGreen mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Voltar
                </button>

                {/* Cabeçalho do Post */}
                <article className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Imagem de Capa */}
                    {post.featuredImage && (
                        <div className="w-full h-[400px] relative">
                            <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-8">
                        {/* Categoria */}
                        <span className="inline-block px-4 py-1 bg-mintGreen text-petroleumGreen rounded-full text-sm font-semibold mb-4">
                            {getCategoryLabel(post.category)}
                        </span>

                        {/* Título */}
                        <h1 className="text-4xl font-bold text-petroleumGreen mb-4">
                            {post.title}
                        </h1>

                        {/* Meta informações */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
                            {post.author && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{post.author.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(post.publishedAt)}</span>
                            </div>
                            {post.readingTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{post.readingTime} min de leitura</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>{post.views || 0} visualizações</span>
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="prose prose-lg max-w-none">
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {post.content}
                            </div>
                        </div>

                        {/* Rodapé do Post */}
                        <div className="mt-12 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => router.push('/pages/blog')}
                                    className="px-6 py-2 bg-petroleumGreen text-white rounded-lg hover:bg-mintGreen hover:text-petroleumGreen transition-colors"
                                >
                                    Ver mais artigos
                                </button>
                                
                                <div className="text-sm text-gray-500">
                                    Publicado em {formatDate(post.publishedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}
