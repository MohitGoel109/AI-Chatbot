function ConversationSidebar({ conversations, activeId, onSelect, onNew, onDelete, onSignOut, userEmail, open, onCloseMobile }) {
  return (
    <div className={`conv-sidebar ${open ? "open" : ""}`}>
      <div className="conv-sidebar-header">
        <button className="new-chat-btn" onClick={onNew}>
          + New chat
        </button>
        <button className="conv-sidebar-close" onClick={onCloseMobile} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="conv-list">
        {conversations.length === 0 && <p className="conv-empty">No saved chats yet</p>}
        {conversations.map((c) => (
          <div key={c.id} className={`conv-item ${c.id === activeId ? "active" : ""}`}>
            <button className="conv-item-title" onClick={() => onSelect(c.id)}>
              {c.title || "New chat"}
            </button>
            <button
              className="conv-item-delete"
              onClick={() => onDelete(c.id)}
              aria-label="Delete conversation"
              title="Delete"
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="conv-sidebar-footer">
        <span className="conv-user-email" title={userEmail}>
          {userEmail}
        </span>
        <button className="sign-out-btn" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default ConversationSidebar;
