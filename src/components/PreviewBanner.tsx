export function PreviewBanner() {
  return (
    <div className="preview-banner" role="status">
      <span className="preview-banner__dot" aria-hidden="true" />
      <p>
        <strong>布局预览</strong>
        <span aria-hidden="true"> · </span>
        示例数据不会写入本地存储，操作按钮已禁用。
      </p>
    </div>
  );
}
