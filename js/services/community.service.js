/**
 * COMMUNITY & SOCIAL FEED SERVICE
 */

class CommunityService {
  static createPost({ text, attachedBet, isOfficial = false }) {
    const currentState = window.sbState.getState();
    const user = currentState.user;
    if (!user) throw new Error('Usuário precisa estar autenticado para publicar.');

    const newPost = {
      id: 'pst_' + Date.now(),
      author: isOfficial ? 'Equipe ScannerBet' : user.name,
      role: isOfficial ? 'Admin' : user.role,
      official: isOfficial || user.role === 'Admin',
      avatar: isOfficial ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop' : user.avatar,
      time: 'Agora mesmo',
      text: text,
      attachedBet: attachedBet || null,
      likes: 0,
      liked: false,
      saved: false,
      comments: []
    };

    const updatedPosts = [newPost, ...currentState.posts];
    window.sbState.setState({ posts: updatedPosts });
    return newPost;
  }

  static toggleLike(postId) {
    const currentState = window.sbState.getState();
    const updatedPosts = currentState.posts.map(post => {
      if (post.id === postId) {
        const liked = !post.liked;
        const likes = liked ? post.likes + 1 : Math.max(0, post.likes - 1);
        return { ...post, liked, likes };
      }
      return post;
    });

    window.sbState.setState({ posts: updatedPosts });
  }

  static toggleSave(postId) {
    const currentState = window.sbState.getState();
    const updatedPosts = currentState.posts.map(post => {
      if (post.id === postId) {
        return { ...post, saved: !post.saved };
      }
      return post;
    });

    window.sbState.setState({ posts: updatedPosts });
  }

  static addComment(postId, commentText) {
    const currentState = window.sbState.getState();
    const user = currentState.user;
    if (!user || !commentText.trim()) return;

    const updatedPosts = currentState.posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          author: user.name,
          text: commentText,
          time: 'Agora mesmo'
        };
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    });

    window.sbState.setState({ posts: updatedPosts });
  }

  static reportPost(postId, reason) {
    // Adds post to admin moderation queue
    const currentState = window.sbState.getState();
    const reportedPost = currentState.posts.find(p => p.id === postId);
    if (reportedPost) {
      const reports = currentState.reportedPosts || [];
      window.sbState.setState({
        reportedPosts: [...reports, { ...reportedPost, reportReason: reason, reportedAt: new Date().toISOString() }]
      });
    }
  }
}

window.CommunityService = CommunityService;
