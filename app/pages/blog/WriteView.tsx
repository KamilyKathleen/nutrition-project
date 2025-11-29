'use client';
import { useState } from 'react';
import { Image, Save, FileText } from 'lucide-react';
import BlogService, { BlogCategory, BlogStatus, CreateBlogPostRequest } from '@/app/services/blogService';

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

export default function WriteView() {
    const [article, setArticle] = useState<CreateBlogPostRequest>({
        title: '',
        content: '',
        featuredImage: '',
        category: BlogCategory.NUTRITION,
        status: BlogStatus.DRAFT
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const postData: CreateBlogPostRequest = {
                ...article,
                status: publish ? BlogStatus.PUBLISHED : BlogStatus.DRAFT
            };

            console.log('📤 [WriteView] Enviando requisição para BlogService.createPost...');
            await BlogService.createPost(postData);
            
            setSuccess(publish ? 'Artigo publicado com sucesso!' : 'Rascunho salvo com sucesso!');
            
            setTimeout(() => {
                setArticle({
                    title: '',
                    content: '',
                    featuredImage: '',
                    category: BlogCategory.NUTRITION,
                    status: BlogStatus.DRAFT
                });
                setSuccess(null);
            }, 2000);
        } catch (err: any) {
            console.error('❌ [WriteView] Erro:', err.message);
            setError(err.message || 'Erro ao salvar artigo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setArticle(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto border-t-4 border-mintGreen">
            <h2 className="text-3xl font-bold text-center text-petroleumGreen mb-8">Escrever Novo Artigo</h2>
            
            {error && (<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>)}
            {success && (<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{success}</div>)}
            
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-coalGray mb-1">
                        Título Principal <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text" name="title" id="title" value={article.title} onChange={handleChange}
                        placeholder="Ex: Receita de Pão de Queijo Saudável"
                        className="w-full p-3 border border-grayishBlue rounded-lg focus:ring-mintGreen focus:border-mintGreen"
                        required minLength={10} maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">{article.title.length}/200 caracteres</p>
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-coalGray mb-1">
                        Categoria <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="category" id="category" value={article.category} onChange={handleChange}
                        className="w-full p-3 border border-grayishBlue rounded-lg focus:ring-mintGreen focus:border-mintGreen"
                        required
                    >
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="featuredImage" className="block text-sm font-medium text-coalGray mb-1">
                        URL da Imagem de Capa <Image className="inline h-4 w-4 ml-1" />
                    </label>
                    <input
                        type="url" name="featuredImage" id="featuredImage" value={article.featuredImage || ''} onChange={handleChange}
                        placeholder="Ex: https://seusite.com/imagem-capa.jpg"
                        className="w-full p-3 border border-grayishBlue rounded-lg focus:ring-mintGreen focus:border-mintGreen"
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-coalGray mb-1">
                        Conteúdo do Artigo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="content" id="content" rows={12} value={article.content} onChange={handleChange}
                        placeholder="Escreva o conteúdo completo do artigo aqui (mínimo 50 caracteres)..."
                        className="w-full p-3 border border-grayishBlue rounded-lg focus:ring-mintGreen focus:border-mintGreen resize-y"
                        required minLength={50} maxLength={50000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{article.content.length}/50000 caracteres</p>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 bg-grayishBlue text-white py-3 px-6 rounded-lg hover:bg-coalGray disabled:opacity-50">
                        <Save className="h-5 w-5" />
                        {loading ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 bg-mintGreen text-coalGray py-3 px-6 rounded-lg hover:bg-petroleumGreen hover:text-white disabled:opacity-50">
                        <FileText className="h-5 w-5" />
                        {loading ? 'Publicando...' : 'Publicar Artigo'}
                    </button>
                </div>
            </form>
        </div>
    );
}
