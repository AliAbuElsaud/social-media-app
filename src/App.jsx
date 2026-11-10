import { useEffect, useMemo, useState } from 'react';
import { api, entityId, listFrom, pickData } from './api.js';
import { Bell, Bookmark, Camera, Check, ChevronDown, Heart, ImagePlus, LogOut, MessageCircle, MoreHorizontal, Plus, Search, Send, Settings, Share2, Sparkles, UserRound, X } from 'lucide-react';

const initials = (s = 'U') => s.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'U';
const personName = (p) => p?.name ?? p?.fullName ?? p?.username ?? p?.user?.name ?? p?.user?.username ?? 'Route member';
const personAvatar = (p) => p?.photo ?? p?.avatar ?? p?.image ?? p?.profilePhoto ?? p?.user?.photo ?? p?.user?.avatar ?? '';
const postText = (p) => p?.body ?? p?.content ?? p?.text ?? '';
const postImage = (p) => p?.image ?? p?.photo ?? p?.media ?? '';
const postOwner = (p) => p?.postCreator ?? p?.user ?? p?.author ?? p?.owner ?? p?.createdBy ?? {};
const recordId = (value) => typeof value === 'string' || typeof value === 'number' ? value : value?._id ?? value?.id ?? value?.userId ?? value?.user?._id ?? value?.user?.id;
const count = (p, fields) => fields.map(f => p?.[f]).find(v => typeof v === 'number') ?? 0;
const dateLabel = (v) => { if (!v) return ''; const d = new Date(v); return Number.isNaN(+d) ? '' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); };
const errorText = (e) => e?.message || 'Something went wrong. Please try again.';
const passwordRule = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;
const passwordHint = 'Use at least 8 characters, including an uppercase letter, a lowercase letter, a number, and one of: # ? ! @ $ % ^ & * -.';

function Avatar({ person, size = 'md' }) {
  const src = personAvatar(person);
  return <span className={`avatar ${size}`}>{src ? <img src={src} alt="" /> : initials(personName(person))}</span>;
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState('signin');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loginField, setLoginField] = useState('email');
  const [form, setForm] = useState({ name: '', username: '', email: '', dateOfBirth: '', gender: 'female', password: '', rePassword: '' });
  const set = (key, value) => setForm(v => ({ ...v, [key]: value }));
  async function submit(e) {
    e.preventDefault(); setError('');
    if (mode === 'signup' && !passwordRule.test(form.password)) { setError(passwordHint); return; }
    if (mode === 'signup' && form.password !== form.rePassword) { setError('The passwords do not match.'); return; }
    setBusy(true);
    try {
      const data = mode === 'signup'
        ? await api('/users/signup', { method: 'POST', token: '', body: { name: form.name, username: form.username, email: form.email, dateOfBirth: form.dateOfBirth, gender: form.gender, password: form.password, rePassword: form.rePassword } })
        : await api('/users/signin', { method: 'POST', token: '', body: { [loginField]: form.email, password: form.password } });
      const result = pickData(data);
      if (!result?.token) throw new Error('The server response did not include data.token. Please check the API response contract.');
      localStorage.setItem('route-token', result.token);
      onAuth(result.user ?? result);
    } catch (e) { const message = errorText(e); setError(mode === 'signup' && /required pattern/i.test(message) ? passwordHint : message); } finally { setBusy(false); }
  }
  return <main className="auth-shell">
    <section className="auth-art"><div className="art-top"><span className="brand-mark">r.</span><span className="live-pill"><i /> community online</span></div>
      <div className="art-copy"><div className="eyebrow"><Sparkles size={15} /> A PLACE TO CONNECT</div><h1>Ideas grow<br /><em>when we share them.</em></h1><p>Reconnect with your community, share your moments, and keep up with the conversation.</p>
        <div className="art-people"><div className="face-stack"><span>AM</span><span>YK</span><span>NO</span><span>+2k</span></div><div><b>A community moving forward</b><small>Connect with your Route network</small></div></div>
      </div><div className="art-shape shape-one" /><div className="art-shape shape-two" /><div className="art-foot">ROUTE SOCIAL <span>·</span> BRINGING PEOPLE TOGETHER</div>
    </section>
    <section className="auth-form-wrap"><div className="mobile-brand"><span className="brand-mark">r.</span> Route Social</div><div className="auth-card">
      <span className="form-kicker">{mode === 'signup' ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</span><h2>{mode === 'signup' ? 'Create your account' : 'Sign in'}</h2><p className="form-sub">{mode === 'signup' ? 'Your community is waiting for you.' : 'It’s good to have you back.'}</p>
      <form onSubmit={submit}>
        {mode === 'signup' && <>
          <label>Full name<input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Maya Hassan" /></label>
          <label>Username<input required value={form.username} onChange={e => set('username', e.target.value)} placeholder="Choose a username" /></label>
          <div className="form-row"><label>Date of birth<input required type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} /></label><label>Gender<select value={form.gender} onChange={e => set('gender', e.target.value)}><option value="female">Female</option><option value="male">Male</option></select></label></div>
        </>}
        {mode === 'signup' ? <label>Email address<input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" /></label> : <label>Email, username, or login<div className="login-input-row"><input required type="text" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Enter your sign-in ID" autoComplete="username" /><select aria-label="Sign-in ID type" value={loginField} onChange={e => setLoginField(e.target.value)}><option value="email">Email</option><option value="username">Username</option><option value="login">Login</option></select></div></label>}
        <label>Password<input required type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />{mode === 'signup' && <small className="field-hint">{passwordHint}</small>}</label>
        {mode === 'signup' && <label>Confirm password<input required type="password" value={form.rePassword} onChange={e => set('rePassword', e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" /></label>}
        {error && <div className="error-box">{error}</div>}<button className="primary-btn full" disabled={busy}>{busy ? 'Loading…' : mode === 'signup' ? 'Create account' : 'Sign in'} <span>→</span></button>
      </form><div className="auth-switch">{mode === 'signup' ? 'Already a member?' : 'Don’t have an account yet?'} <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></div>
    </div><div className="auth-legal">By continuing, you agree to the Route Social Terms of Use.</div></section>
  </main>;
}

function PostCard({ post, currentUser, onOpen, onLike, onBookmark, onEdit, onDelete, onShare }) {
  const author = postOwner(post); const id = entityId(post);
  const mine = String(author?._id ?? author?.id ?? '') === String(currentUser?._id ?? currentUser?.id ?? '');
  const liked = Boolean(post?.isLiked ?? post?.liked ?? post?.isLikedByMe);
  const bookmarked = Boolean(post?.isBookmarked ?? post?.bookmarked);
  const [menu, setMenu] = useState(false);
  return <article className="post-card">
    <div className="post-head"><Avatar person={author} /><div className="post-author"><b>{personName(author)}</b><span>@{author?.username ?? 'member'} <i>·</i> {dateLabel(post?.createdAt ?? post?.created_at)}</span></div>
      <div className="post-menu-wrap"><button className="icon-btn" aria-label="Options" onClick={() => setMenu(v => !v)}><MoreHorizontal size={20} /></button>{menu && <div className="menu-pop">{mine && <><button onClick={() => { setMenu(false); onEdit(post); }}>Edit post</button><button className="danger-text" onClick={() => { setMenu(false); onDelete(id); }}>Delete</button></>}</div>}</div>
    </div>
    {postText(post) && <p className="post-copy">{postText(post)}</p>}
    {postImage(post) && <img className="post-photo" src={typeof postImage(post) === 'string' ? postImage(post) : postImage(post)?.url} alt="Post image" />}
    <div className="post-stats"><span><span className="tiny-heart">♥</span> {count(post, ['likesCount', 'likes', 'likeCount'])} likes</span><button onClick={() => onOpen(post)}>{count(post, ['commentsCount', 'commentCount'])} comments</button></div>
    <div className="post-actions"><button className={liked ? 'is-active' : ''} onClick={() => onLike(id)}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /> Like</button><button onClick={() => onOpen(post)}><MessageCircle size={18} /> Comment</button><button onClick={() => onShare(id)}><Share2 size={17} /> Share</button><button className={`bookmark-action ${bookmarked ? 'is-active' : ''}`} aria-label="Save" onClick={() => onBookmark(id)}><Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} /></button></div>
  </article>;
}

function Composer({ user, onSubmit, initial = '', editing = false, onCancel, hasImage = false }) {
  const [text, setText] = useState(initial); const [file, setFile] = useState(null); const [removeImage, setRemoveImage] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => setText(initial), [initial]);
  async function submit(e) { e.preventDefault(); if (!text.trim() && !file && !hasImage) return; setBusy(true); try { const result = await onSubmit(text.trim(), file, removeImage); if (result === false) return; setText(''); setFile(null); } finally { setBusy(false); } }
  return <form className="composer" onSubmit={submit}><Avatar person={user} /><div className="composer-main"><textarea value={text} onChange={e => setText(e.target.value)} placeholder="What’s new with you today?" rows="2" />{file && <div className="file-chip">{file.name}<button type="button" onClick={() => setFile(null)}><X size={14} /></button></div>}{hasImage && <button type="button" className={`remove-image-toggle ${removeImage ? 'checked' : ''}`} onClick={() => setRemoveImage(v => !v)}><Check size={13} /> {removeImage ? 'The photo will be removed' : 'Remove current photo'}</button>}<div className="composer-tools"><label className="attach-btn"><ImagePlus size={17} /> Photo<input type="file" accept="image/*" onChange={e => { setFile(e.target.files?.[0] ?? null); setRemoveImage(false); }} hidden /></label><span className="composer-right">{editing && <button type="button" className="text-btn" onClick={onCancel}>Cancel</button>}<button className="primary-btn small" disabled={busy || (!text.trim() && !file && !hasImage)}>{busy ? 'Posting…' : editing ? 'Save' : <><Plus size={16} /> Post</>}</button></span></div></div></form>;
}

function Comment({ comment, postId, currentUser, postOwnerId, refresh, notify }) {
  const [editing, setEditing] = useState(false); const [text, setText] = useState(comment?.content ?? comment?.body ?? ''); const [replies, setReplies] = useState([]); const [showReplies, setShowReplies] = useState(false); const [replyText, setReplyText] = useState(''); const [busy, setBusy] = useState(false);
  const author = comment?.commentCreator ?? comment?.user ?? comment?.author ?? comment?.owner ?? comment?.userId ?? {};
  const currentUserId = recordId(currentUser);
  const mine = currentUserId != null && String(recordId(author) ?? recordId(comment?.userId)) === String(currentUserId);
  const canDelete = mine || (currentUserId != null && postOwnerId != null && String(currentUserId) === String(postOwnerId));
  async function loadReplies() { const result = await api(`/posts/${postId}/comments/${entityId(comment)}/replies?page=1&limit=10`); setReplies(listFrom(result)); setShowReplies(true); }
  async function save() { const body = new FormData(); body.append('content', text); setBusy(true); try { await api(`/posts/${postId}/comments/${entityId(comment)}`, { method: 'PUT', body }); setEditing(false); refresh(); } catch (e) { notify(errorText(e)); } finally { setBusy(false); } }
  async function remove() { if (!window.confirm('Delete this comment?')) return; try { await api(`/posts/${postId}/comments/${entityId(comment)}`, { method: 'DELETE' }); refresh(); } catch (e) { notify(errorText(e)); } }
  async function reply(e) { e.preventDefault(); const body = new FormData(); body.append('content', replyText); try { await api(`/posts/${postId}/comments/${entityId(comment)}/replies`, { method: 'POST', body }); setReplyText(''); await loadReplies(); } catch (e) { notify(errorText(e)); } }
  return <div className="comment-row"><Avatar person={author} size="sm" /><div className="comment-content"><div className="comment-bubble"><div className="comment-name">{personName(author)} <span>{dateLabel(comment?.createdAt)}</span></div>{editing ? <div className="edit-comment"><input value={text} onChange={e => setText(e.target.value)} /><button onClick={save} disabled={busy}>OK</button></div> : <p>{comment?.content ?? comment?.body ?? ''}</p>}</div><div className="comment-tools"><button onClick={async () => { try { await api(`/posts/${postId}/comments/${entityId(comment)}/like`, { method: 'PUT' }); refresh(); } catch (e) { notify(errorText(e)); } }}>Like</button><button onClick={() => setShowReplies(v => !v)}>{showReplies ? 'Hide' : 'Reply'}</button>{mine && <button onClick={() => setEditing(v => !v)}>Edit</button>}{canDelete && <button onClick={remove}>Delete</button>}</div>
    {showReplies && <div className="replies">{replies.map(r => <div className="reply-line" key={entityId(r)}><b>{personName(r?.commentCreator ?? r?.user ?? r?.author)}</b> {r?.content ?? r?.body}</div>)}<form className="reply-form" onSubmit={reply}><input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply…" /><button aria-label="Send"><Send size={15} /></button></form></div>}
    </div></div>;
}

function Detail({ post, currentUser, onClose, notify }) {
  const id = entityId(post); const [comments, setComments] = useState([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1);
  async function refresh() { setLoading(true); try { const res = await api(`/posts/${id}/comments?page=${page}&limit=10`); setComments(listFrom(res)); } catch (e) { notify(errorText(e)); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, [id, page]);
  async function createComment(text, file) { const body = new FormData(); if (text) body.append('content', text); if (file) body.append('image', file); try { await api(`/posts/${id}/comments`, { method: 'POST', body }); refresh(); return true; } catch (e) { notify(errorText(e)); return false; } }
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="detail-modal"><header className="modal-head"><div><span className="form-kicker">CONVERSATION</span><h2>Post</h2></div><button className="icon-btn" onClick={onClose}><X size={21} /></button></header><div className="detail-post"><div className="post-head"><Avatar person={postOwner(post)} /><div className="post-author"><b>{personName(postOwner(post))}</b><span>{dateLabel(post?.createdAt)}</span></div></div><p className="post-copy">{postText(post)}</p>{postImage(post) && <img className="post-photo" src={typeof postImage(post) === 'string' ? postImage(post) : postImage(post)?.url} alt="" />}</div><div className="comment-list"><h3>Comments <span>{comments.length}</span></h3>{loading ? <div className="muted">Loading…</div> : comments.length ? comments.map(c => <Comment key={entityId(c)} comment={c} postId={id} currentUser={currentUser} postOwnerId={recordId(postOwner(post))} refresh={refresh} notify={notify} />) : <div className="empty-comments">No comments yet. Start the conversation.</div>}{comments.length >= 10 && <button className="text-btn load-more" onClick={() => setPage(v => v + 1)}>Load more</button>}</div><div className="detail-composer"><Composer user={currentUser} onSubmit={createComment} /></div></section></div>;
}

function PasswordPanel({ onClose, notify }) {
  const [password, setPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) { e.preventDefault(); setBusy(true); try { const r = pickData(await api('/users/change-password', { method: 'PATCH', body: { password, newPassword } })); if (r?.token) localStorage.setItem('route-token', r.token); notify('Password changed.'); onClose(); } catch (e) { notify(errorText(e)); } finally { setBusy(false); } }
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="small-modal"><header className="modal-head"><div><span className="form-kicker">SECURITY</span><h2>Change password</h2></div><button className="icon-btn" onClick={onClose}><X size={20} /></button></header><form className="stack-form" onSubmit={submit}><label>Current password<input required type="password" value={password} onChange={e => setPassword(e.target.value)} /></label><label>New password<input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></label><button className="primary-btn full" disabled={busy}>{busy ? 'Updating…' : 'Save new password'}</button></form></section></div>;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('route-token'));
  const [user, setUser] = useState(null); const [view, setView] = useState('home'); const [posts, setPosts] = useState([]); const [loading, setLoading] = useState(false); const [notice, setNotice] = useState(''); const [detail, setDetail] = useState(null); const [editingPost, setEditingPost] = useState(null); const [passwordOpen, setPasswordOpen] = useState(false); const [query, setQuery] = useState('');
  function notify(msg) { setNotice(msg); setTimeout(() => setNotice(''), 4200); }
  async function loadProfile() { try { const p = pickData(await api('/users/profile-data')); setUser(p?.user ?? p); } catch (e) { if (/401|unauthor|token/i.test(errorText(e))) logout(); else notify(errorText(e)); } }
  async function loadPosts() { setLoading(true); try { let res; if (view === 'profile') { const profile = pickData(await api('/users/profile-data')); const current = profile?.user ?? profile; const id = current?._id ?? current?.id ?? current?.userId; if (id) res = await api(`/users/${id}/posts`); else { setPosts([]); return; } } else res = await api('/posts'); setPosts(listFrom(res)); } catch (e) { notify(errorText(e)); } finally { setLoading(false); } }
  useEffect(() => { if (token) { loadProfile(); loadPosts(); } }, [token]);
  useEffect(() => { if (token) loadPosts(); }, [view]);
  function logout() { localStorage.removeItem('route-token'); setToken(null); setUser(null); setPosts([]); }
  async function afterAuth(authUser) { setUser(authUser); setToken(localStorage.getItem('route-token')); }
  async function createPost(text, file) { const body = new FormData(); if (text) body.append('body', text); if (file) body.append('image', file); try { await api('/posts', { method: 'POST', body }); notify('Post created.'); loadPosts(); return true; } catch (e) { notify(errorText(e)); return false; } }
  async function updatePost(text, file, removeImage) { const body = new FormData(); if (text) body.append('body', text); if (file) body.append('image', file); else if (removeImage) body.append('image', ''); try { await api(`/posts/${entityId(editingPost)}`, { method: 'PUT', body }); setEditingPost(null); notify('Post updated.'); loadPosts(); return true; } catch (e) { notify(errorText(e)); return false; } }
  async function deletePost(id) { if (!window.confirm('Delete this post?')) return; try { await api(`/posts/${id}`, { method: 'DELETE' }); notify('Post deleted.'); loadPosts(); } catch (e) { notify(errorText(e)); } }
  async function toggle(path, id) { try { await api(`/posts/${id}/${path}`, { method: 'PUT' }); loadPosts(); } catch (e) { notify(errorText(e)); } }
  async function share(id) { const message = window.prompt('Add a message to your share (optional):', 'I’m sharing this post.'); if (message === null) return; try { await api(`/posts/${id}/share`, { method: 'POST', body: { body: message } }); notify('Post shared.'); loadPosts(); } catch (e) { notify(errorText(e)); } }
  function openComposer() { if (view !== 'home') { setView('home'); window.setTimeout(() => document.querySelector('.composer textarea')?.focus(), 80); } else document.querySelector('.composer textarea')?.focus(); }
  const visiblePosts = useMemo(() => posts.filter(p => `${postText(p)} ${personName(postOwner(p))}`.toLowerCase().includes(query.toLowerCase())), [posts, query]);
  if (!token) return <Auth onAuth={afterAuth} />;
  return <div className="app-shell"><header className="topbar"><div className="topbar-inner"><button className="brand" onClick={() => setView('home')}><span className="brand-mark">r.</span><span>route<span className="brand-light">social</span></span></button><div className="top-search"><Search size={17} /><input placeholder="Search your feed…" value={query} onChange={e => setQuery(e.target.value)} /></div><nav className="top-nav"><button className={view === 'home' ? 'nav-on' : ''} onClick={() => setView('home')}>News feed</button><button className={view === 'profile' ? 'nav-on' : ''} onClick={() => setView('profile')}>My profile</button></nav><div className="top-user"><button className="icon-btn notification-btn" onClick={() => notify('Notifications are not part of this project’s requirements.') }><Bell size={19} /></button><button className="user-chip" onClick={() => setView('profile')}><Avatar person={user} size="sm" /><span>{personName(user).split(' ')[0]}</span><ChevronDown size={14} /></button><button className="icon-btn logout-btn" onClick={logout} title="Sign out"><LogOut size={17} /></button></div></div></header>
    <main className="layout"><aside className="left-rail"><div className="rail-profile"><div className="profile-cover"><span className="cover-sun" /></div><div className="rail-person"><Avatar person={user} size="lg" /><b>{personName(user)}</b><small>@{user?.username ?? 'route-member'}</small><div className="rail-line" /><div className="rail-stats"><span><b>{posts.length}</b><small>Posts</small></span><span><b>Route</b><small>Community</small></span></div><button className="outline-btn" onClick={() => setView('profile')}>View my profile <span>↗</span></button></div></div><div className="rail-menu"><span className="rail-label">WORKSPACE</span><button className={view === 'home' ? 'selected' : ''} onClick={() => setView('home')}><span className="rail-icon blue">⌂</span> News feed</button><button className={view === 'profile' ? 'selected' : ''} onClick={() => setView('profile')}><span className="rail-icon purple">♙</span> My profile</button><button onClick={() => setPasswordOpen(true)}><span className="rail-icon green"><Settings size={16} /></span> Password</button></div><div className="rail-tip"><Sparkles size={16} /><b>Have an idea to share?</b><span>Your next post could start a great conversation.</span><button onClick={openComposer}>Write a post <span>→</span></button></div></aside>
    <section className="feed-column"><div className="feed-title"><div><span className="form-kicker">YOUR COMMUNITY</span><h1>{view === 'profile' ? 'My profile' : 'News feed'}<span className="title-dot">.</span></h1><p>{view === 'profile' ? 'Your information and recent posts.' : 'Updates from your network, all in one place.'}</p></div><button className="primary-btn new-post" onClick={openComposer}><Plus size={17} /> New post</button></div>
      {view === 'profile' && <ProfileCard user={user} onPassword={() => setPasswordOpen(true)} onPhoto={async file => { const body = new FormData(); body.append('photo', file); try { await api('/users/upload-photo', { method: 'PUT', body }); loadProfile(); notify('Profile photo updated.'); } catch (e) { notify(errorText(e)); } }} />}
      {view === 'home' && !editingPost && <div className="composer-card"><Composer user={user} onSubmit={createPost} /></div>}{editingPost && <div className="composer-card"><div className="edit-label">EDIT POST</div><Composer user={user} initial={postText(editingPost)} hasImage={Boolean(postImage(editingPost))} editing onCancel={() => setEditingPost(null)} onSubmit={updatePost} /></div>}
      <div className="feed-sort"><span>{view === 'profile' ? 'MY POSTS' : 'RECENT IN YOUR FEED'}</span><button onClick={loadPosts}>Refresh <span>↻</span></button></div>
      {loading ? <div className="loading-card"><span className="spinner" /> Loading posts…</div> : visiblePosts.length ? <div className="posts-list">{visiblePosts.map(p => <PostCard key={entityId(p)} post={p} currentUser={user} onOpen={setDetail} onLike={id => toggle('like', id)} onBookmark={id => toggle('bookmark', id)} onEdit={setEditingPost} onDelete={deletePost} onShare={share} />)}</div> : <div className="empty-feed"><div className="empty-icon"><MessageCircle size={22} /></div><h3>{query ? 'No results' : 'Your feed is ready'}</h3><p>{query ? 'Try another keyword.' : 'There are no posts to show yet. Publish a message to get started.'}</p>{!query && <button className="primary-btn small" onClick={openComposer}><Plus size={15} /> Create a post</button>}</div>}
    </section><aside className="right-rail"><div className="welcome-card"><span className="welcome-orb"><Sparkles size={19} /></span><span className="form-kicker">WELCOME TO ROUTE</span><h3>Good things start with a conversation.</h3><p>Share your ideas and join the community conversation.</p><div className="welcome-footer"><span>Route Social</span><span>01 / 01</span></div></div><div className="right-note"><span className="form-kicker">ABOUT</span><p>A social app to share, discover, and stay close to your community.</p><div>Terms <i>·</i> Privacy <i>·</i> Help</div><small>© Route Social 2026</small></div><div className="online-card"><span className="online-dot" /> Route Posts API connected <Check size={14} /></div></aside></main>
    {detail && <Detail post={detail} currentUser={user} onClose={() => setDetail(null)} notify={notify} />}{passwordOpen && <PasswordPanel onClose={() => setPasswordOpen(false)} notify={notify} />}{notice && <div className="toast"><span>i</span>{notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
  </div>;
}

function ProfileCard({ user, onPassword, onPhoto }) {
  return <div className="profile-card"><div className="profile-banner"><div className="banner-grid" /></div><div className="profile-info"><div className="profile-photo-wrap"><Avatar person={user} size="xl" /><label className="photo-edit" title="Change photo"><Camera size={15} /><input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && onPhoto(e.target.files[0])} /></label></div><div className="profile-main-info"><h2>{personName(user)}</h2><span>@{user?.username ?? 'route-member'}</span><p>{user?.bio ?? 'Route Social community member.'}</p></div><button className="outline-btn profile-password" onClick={onPassword}><Settings size={15} /> Change password</button></div><div className="profile-meta"><span><UserRound size={15} /> {user?.email ?? 'Email address unavailable'}</span><span><i className="online-dot" /> Route Social account</span></div></div>;
}
