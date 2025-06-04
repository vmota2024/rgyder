import React, { useState, useEffect, useCallback } from 'react';
import { Post, PartialPost, ViewMode, ClientProfile, PostStatus, PostType } from './types';
import Header from './components/Header';
import PostList from './components/PostList';
import PostFormModal from './components/PostFormModal';
import CalendarView from './components/CalendarView';
import FeedMockupView from './components/FeedMockupView';
import ViewSwitcher from './components/ViewSwitcher';
import ClientProfileSettingsModal from './components/ClientProfileSettingsModal';
import PostDetailModal from './components/PostDetailModal';
import { PlusIcon, ImagePlaceholderIcon } from './components/Icons';

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [modalDate, setModalDate] = useState<string | undefined>(undefined);

  const [clientProfile, setClientProfile] = useState<ClientProfile>({
    username: 'seu_usuario',
    bio: 'Sua bio incrível aqui!',
    profileImageUrl: '',
  });
  const [isClientProfileModalOpen, setIsClientProfileModalOpen] = useState(false);
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | undefined>(undefined);


  useEffect(() => {
    const storedPosts = localStorage.getItem('ezenPlannerPosts');
    if (storedPosts) {
      try {
        const parsedPosts: Post[] = JSON.parse(storedPosts);
        setPosts(parsedPosts.map(p => ({ 
          ...p, 
          imageUrl: p.imageUrl || '',
          status: p.status || 'Pendente',
          feedbackComments: p.feedbackComments || '',
          postType: p.postType || 'image',
          uploadedVideoDataUrl: p.uploadedVideoDataUrl || '', // Garante que uploadedVideoDataUrl exista
          videoUrl: undefined // Remove o campo antigo, se existir
        })));
      } catch (e) {
        console.error("Falha ao analisar posts do localStorage", e);
        setPosts([]);
      }
    }

    const storedProfile = localStorage.getItem('ezenPlannerClientProfile');
    if (storedProfile) {
      try {
        setClientProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error("Falha ao analisar perfil do cliente do localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ezenPlannerPosts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('ezenPlannerClientProfile', JSON.stringify(clientProfile));
  }, [clientProfile]);

  const handleOpenModal = useCallback((post?: Post, date?: string) => {
    setEditingPost(post);
    setModalDate(date);
    setIsModalOpen(true);
    setIsPostDetailModalOpen(false); 
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingPost(undefined);
    setModalDate(undefined);
  }, []);

  const handleSavePost = useCallback((postData: PartialPost) => {
    setPosts(prevPosts => {
      if (postData.id) {
        return prevPosts.map(p =>
          p.id === postData.id ? { 
            ...p, 
            ...postData, 
            imageUrl: postData.imageUrl || p.imageUrl || '',
            status: postData.status || p.status || 'Pendente',
            feedbackComments: postData.feedbackComments || p.feedbackComments || '',
            postType: postData.postType || p.postType || 'image',
            uploadedVideoDataUrl: postData.postType === 'video' ? (postData.uploadedVideoDataUrl || p.uploadedVideoDataUrl || '') : '',
            videoUrl: undefined, // Garante que o campo antigo seja removido
          } as Post : p
        );
      }
      const newId = Date.now().toString();
      return [
        ...prevPosts,
        {
          id: newId,
          topic: postData.topic || '',
          caption: postData.caption || '',
          imageUrl: postData.imageUrl || '',
          scheduledDate: postData.scheduledDate || '',
          hashtags: postData.hashtags || [],
          status: postData.status || 'Pendente',
          feedbackComments: postData.feedbackComments || '',
          postType: postData.postType || 'image',
          uploadedVideoDataUrl: postData.postType === 'video' ? (postData.uploadedVideoDataUrl || '') : '',
          videoUrl: undefined, // Garante que o campo antigo seja removido
        } as Post,
      ];
    });
    handleCloseModal();
    if (selectedPostForDetail && selectedPostForDetail.id === postData.id) {
        setSelectedPostForDetail(prev => prev ? {
            ...prev,
            ...postData,
            status: postData.status || prev.status,
            feedbackComments: postData.feedbackComments || prev.feedbackComments,
            postType: postData.postType || prev.postType,
            uploadedVideoDataUrl: postData.postType === 'video' ? (postData.uploadedVideoDataUrl || prev.uploadedVideoDataUrl) : '',
            videoUrl: undefined, // Garante que o campo antigo seja removido
        } as Post : undefined);
    }

  }, [handleCloseModal, selectedPostForDetail]);

  const handleDeletePost = useCallback((id: string) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
    if (selectedPostForDetail && selectedPostForDetail.id === id) {
        setIsPostDetailModalOpen(false);
        setSelectedPostForDetail(undefined);
    }
  }, [selectedPostForDetail]);

  const handleOpenClientProfileModal = () => setIsClientProfileModalOpen(true);
  const handleCloseClientProfileModal = () => setIsClientProfileModalOpen(false);
  const handleSaveClientProfile = (profile: ClientProfile) => {
    setClientProfile(profile);
    handleCloseClientProfileModal();
  };

  const handleOpenPostDetailModal = (post: Post) => {
    setSelectedPostForDetail(post);
    setIsPostDetailModalOpen(true);
  };
  const handleClosePostDetailModal = () => {
    setIsPostDetailModalOpen(false);
    setSelectedPostForDetail(undefined);
  };
  
  const handleEditFromDetailView = (post: Post) => {
    setIsPostDetailModalOpen(false); 
    handleOpenModal(post); 
  };


  const renderView = () => {
    switch (viewMode) {
      case 'calendar':
        return <CalendarView posts={posts} onSelectDate={(date) => handleOpenModal(undefined, date)} onEditPost={handleOpenModal} />;
      case 'feed':
        return <FeedMockupView posts={posts} clientProfile={clientProfile} onPostClick={handleOpenPostDetailModal} />;
      case 'grid':
      default:
        return <PostList posts={posts} onEdit={handleOpenModal} onDelete={handleDeletePost} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header 
        onAddPost={() => handleOpenModal()} 
        onOpenProfileSettings={handleOpenClientProfileModal}
      />
      <main className="p-4 md:p-8 flex-grow">
        <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
        {posts.length === 0 && !isModalOpen && viewMode === 'grid' && (
          <div className="text-center py-12 flex flex-col items-center">
            <ImagePlaceholderIcon className="w-24 h-24 text-slate-300 mb-6" />
            <h2 className="text-2xl font-semibold text-slate-600 mb-4">Seu Hub de Conteúdo está Vazio</h2>
            <p className="text-slate-500 mb-6 max-w-md">
              Parece que você ainda não planejou nenhum post. Clique no botão abaixo para adicionar sua primeira obra-prima!
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center mx-auto"
              aria-label="Adicionar novo post"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Adicionar Novo Post
            </button>
          </div>
        )}
        { (posts.length > 0 || viewMode !== 'grid' || isModalOpen || isPostDetailModalOpen) && renderView() }
      </main>
      {isModalOpen && (
        <PostFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSavePost}
          initialPost={editingPost}
          initialDate={modalDate}
        />
      )}
      {isClientProfileModalOpen && (
        <ClientProfileSettingsModal
          isOpen={isClientProfileModalOpen}
          onClose={handleCloseClientProfileModal}
          onSave={handleSaveClientProfile}
          currentProfile={clientProfile}
        />
      )}
      {isPostDetailModalOpen && selectedPostForDetail && (
        <PostDetailModal
          isOpen={isPostDetailModalOpen}
          onClose={handleClosePostDetailModal}
          post={selectedPostForDetail}
          clientProfile={clientProfile}
          onEdit={handleEditFromDetailView}
        />
      )}
    </div>
  );
};

export default App;