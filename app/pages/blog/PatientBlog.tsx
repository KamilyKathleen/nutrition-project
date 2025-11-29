'use client';
import { useEffect, useState } from 'react';
import Card from "@/app/components/card";
import BlogService, { BlogPost, BlogCategory, BlogStatus } from '@/app/services/blogService';
import { Search, Filter, X } from 'lucide-react';

const CATEGORY_LABELS: Record<BlogCategory, string> = {
    [BlogCategory.NUTRITION]: 'Nutrição',
    [BlogCategory.RECIPES]: 'Receitas',
    [BlogCategory.TIPS]: 'Dicas',
    [BlogCategory.DISEASES]: 'Doenças',
    [BlogCategory.SUPPLEMENTS]: 'Suplementos',
    [BlogCategory.WEIGHT_LOSS]: 'Emagrecimento',
    [BlogCategory.SPORTS_NUTRITION]: 'Nutrição Esportiva',
    [BlogCategory.CHILD_NUTRITION]: 'Nutrição Infantil',
    [BlogCategory.ELDERLY_NUTRITION]: 'Nutrição para Idosos',
    [BlogCategory.VEGETARIAN]: 'Vegetariano/Vegano',
    [BlogCategory.FUNCTIONAL_FOOD]: 'Alimentos Funcionais',
    [BlogCategory.FOOD_SAFETY]: 'Segurança Alimentar'
};

export default function PatientBlog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filtros
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory | ''>('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [posts, searchText, selectedCategory]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await BlogService.getPublicPosts({ 
                limit: 100,
                sortBy: 'publishedAt',
                sortOrder: 'desc',
                status: 'published' // Pacientes veem apenas posts publicados
            });
            setPosts(response.data);
        } catch (err: any) {
            console.error('Erro ao buscar posts:', err);
            setError('Erro ao carregar os posts. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...posts];

        // Filtro por categoria
        if (selectedCategory) {
            filtered = filtered.filter(post => post.category === selectedCategory);
        }

        // Filtro por texto (busca no título, conteúdo e autor)
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(search) ||
                post.content.toLowerCase().includes(search) ||
                (post.author?.name && post.author.name.toLowerCase().includes(search))
            );
        }

        setFilteredPosts(filtered);
    };

    const clearFilters = () => {
        setSearchText('');
        setSelectedCategory('');
    };

    const hasActiveFilters = searchText || selectedCategory;

    if (loading) {
        return (
            <div className="w-[90%] mx-auto my-10">
                <h2 className="text-3xl font-bold text-center text-petroleumGreen mb-8">Artigos Publicados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                            <div className="bg-white p-4 rounded-b-lg space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-[90%] mx-auto my-10">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="w-[95%] mx-auto my-10 space-y-6">
            <h2 className="text-3xl font-bold text-center text-petroleumGreen mb-4">Artigos Publicados</h2>
            
            {/* Barra de Busca e Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                {/* Busca por texto */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Buscar por título, conteúdo ou autor..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                            showFilters ? 'bg-petroleumGreen text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Filter className="h-5 w-5" />
                        Filtros
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-3 rounded-lg flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                            <X className="h-5 w-5" />
                            Limpar
                        </button>
                    )}
                </div>

                {/* Filtros expandidos */}
                {showFilters && (
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                        {/* Filtro por categoria */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoria
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as BlogCategory | '')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen"
                            >
                                <option value="">Todas as categorias</option>
                                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Contador de resultados */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        {filteredPosts.length} {filteredPosts.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
                    </span>
                    {hasActiveFilters && (
                        <span className="text-petroleumGreen font-medium">
                            Filtros ativos
                        </span>
                    )}
                </div>
            </div>

            {/* Grid de Posts */}
            {filteredPosts.length === 0 ? (
                <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-12 rounded-lg text-center">
                    <p className="text-lg font-medium">Nenhum artigo encontrado</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {hasActiveFilters 
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Novos conteúdos serão publicados em breve!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <div key={post._id} className="group">
                            <Card
                                image={post.featuredImage || '/img/default-blog.jpg'}
                                title={CATEGORY_LABELS[post.category as BlogCategory] || ''}
                                subtitle={post.title}
                                description={post.content.substring(0, 120) + '...'}
                                page={`/pages/blog/${post.slug}`}
                                button="Ler mais"
                            />
                            {/* Info adicional */}
                            <div className="mt-2 px-2 flex items-center justify-between text-xs text-gray-500">
                                {post.author && (
                                    <span className="flex items-center gap-1">
                                        👤 {post.author.name}
                                    </span>
                                )}
                                {post.readingTime && (
                                    <span className="flex items-center gap-1">
                                        ⏱️ {post.readingTime} min
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}