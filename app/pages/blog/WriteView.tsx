'use client';
import { useState } from 'react';
import { Image, Save } from 'lucide-react';

type ArticleData = {
    title: string;
    subtitle: string;
    imageUrl: string;
    body: string;
};

export default function WriteView() {
    const [article, setArticle] = useState<ArticleData>({
        title: '',
        subtitle: '',
        imageUrl: '',
        body: '',
    });

    // Função dummy para o frontend
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Dados do artigo prontos para envio (Frontend):', article);
        // Lógica do backend aqui
        alert('Artigo simulado salvo!');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setArticle(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto border-t-4 border-mintGreen">
            <h2 className="text-3xl font-bold text-center text-petroleumGreen mb-8">Escrever Novo Artigo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-coalGray mb-1">
                        Título Principal
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        value={article.title}
                        onChange={handleChange}
                        placeholder="Ex: Receita de Pão de Queijo Saudável"
                        className="w-full p-3 border border-grayishBlue rounded-lg focus:ring-mintGreen focus:border-mintGreen transition duration-150"
                        required
                    />
                </div>

                {/* 2. Subtitle */}
                <div>
                    <label htmlFor="subtitle" className="block text-sm font-medium text-coalGray mb-1">
                        Subtítulo / Descrição Curta
                    </label>
                    <input
                        type="text"
                        name="subtitle"
                        id="subtitle"
                        value={article.subtitle}
                        onChange={handleChange}
                        placeholder="Ex: Uma opção nutritiva e rápida para seu café da manhã."
                        className="w-full p-3 border border-grayishBlue rounded-lg focus:ring-mintGreen focus:border-mintGreen transition duration-150"
                        required
                    />
                </div>

                {/* 3. Image (URL) */}
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-coalGray mb-1">
                        URL da Imagem de Capa <Image className="inline h-4 w-4 ml-1" />
                    </label>
                    <input
                        type="url"
                        name="imageUrl"
                        id="imageUrl"
                        value={article.imageUrl}
                        onChange={handleChange}
                        placeholder="Ex: https://seusite.com/imagem-capa.jpg"
                        className="w-full p-3 border border-grayishBlue rounded-lg focus:ring-mintGreen focus:border-mintGreen transition duration-150"
                    />
                </div>

                {/* 4. Body */}
                <div>
                    <label htmlFor="body" className="block text-sm font-medium text-coalGray mb-1">
                        Conteúdo do Artigo
                    </label>
                    <textarea
                        name="body"
                        id="body"
                        rows={8}
                        value={article.body}
                        onChange={handleChange}
                        placeholder="Comece a escrever seu artigo aqui. Use Markdown ou HTML para formatação..."
                        className="w-full p-3 border border-grayishBlue rounded-lg focus:ring-mintGreen focus:border-mintGreen transition duration-150 resize-y"
                        required
                    />
                </div>

                {/* 5. Save Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center cursor-pointer px-4 py-3 font-semibold bg-mintGreen text-coalGray hover:bg-petroleumGreen hover:text-white border border-transparent rounded-lg shadow-sm text-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mintGreen transition duration-150"
                    >
                        <Save className="h-5 w-5 mr-2" />
                        Salvar e Publicar Artigo
                    </button>
                </div>
            </form>
        </div>
    );
}