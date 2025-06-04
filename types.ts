export type PostStatus = 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Revisar';
export type PostType = 'image' | 'video';

export interface Post {
  id: string;
  topic: string; // Usado para geração de IA e pode ser um tema geral
  caption: string;
  imageUrl: string; // Pode ser uma URL de dados base64 ou uma string vazia para nenhuma imagem
  scheduledDate: string; // Formato de string ISO: YYYY-MM-DD
  hashtags: string[];
  status: PostStatus;
  feedbackComments?: string;
  postType: PostType;
  uploadedVideoDataUrl?: string; // Dados do vídeo carregado em base64
}

// Para o formulário, imageUrl e uploadedVideoDataUrl são opcionais.
// O status também pode ser opcional no formulário, assumindo um padrão.
export type PartialPost = Omit<Post, 'id' | 'status' | 'postType'> & { 
  id?: string; 
  imageUrl?: string; 
  status?: PostStatus;
  postType?: PostType;
  uploadedVideoDataUrl?: string;
};

export type ViewMode = 'grid' | 'calendar' | 'feed';

export interface ClientProfile {
  username: string;
  bio: string;
  profileImageUrl: string; // URL de dados base64 ou string vazia
}