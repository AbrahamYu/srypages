export default function Home() {
  return (
    <div className="container">
      <section className="section">
        {/* Featured Hero Post */}
        <div className="hero-post">
          <div className="hero-image" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
          <div className="hero-content">
            <span className="post-category">Architecture</span>
            <h1 className="hero-title">
              <a href="#">The Evolution of Distributed Systems in 2026</a>
            </h1>
            <p className="hero-excerpt">
              Exploring the shift from monolithic architectures to microservices, and how modern orchestration tools are changing the way we build backend applications.
            </p>
            <div className="author-info">
              <div className="author-avatar" style={{backgroundImage: 'url("https://ui-avatars.com/api/?name=Abraham+Yoo&background=0D8ABC&color=fff")', backgroundSize: 'cover'}}></div>
              <div>
                <div className="author-name">Abraham Yoo</div>
                <div className="post-date">Jul 19, 2026 · 8 min read</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts Grid */}
        <h2 className="section-title">Latest Articles</h2>
        <div className="card-grid">
          {/* Post 1 */}
          <article className="post-card">
            <div className="post-card-image" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1623282033815-40b05d96c903?auto=format&fit=crop&w=600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
            <div className="post-card-content">
              <span className="post-category">Backend</span>
              <h3 className="post-title"><a href="#">Building Scalable Data Pipelines with Node.js & Postgres</a></h3>
              <p className="post-excerpt">Learn how to architect robust data ingestion systems that can handle thousands of concurrent streams.</p>
              <div className="post-meta">
                <div className="author-info">
                  <div className="author-avatar" style={{backgroundImage: 'url("https://ui-avatars.com/api/?name=Abraham+Yoo&background=0D8ABC&color=fff")', backgroundSize: 'cover'}}></div>
                  <span className="author-name">Abraham Yoo</span>
                </div>
                <span className="post-date">Oct 24, 2026</span>
              </div>
            </div>
          </article>

          {/* Post 2 */}
          <article className="post-card">
            <div className="post-card-image" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
            <div className="post-card-content">
              <span className="post-category">DevOps</span>
              <h3 className="post-title"><a href="#">Zero Downtime Migration Strategies for Monoliths</a></h3>
              <p className="post-excerpt">A comprehensive guide on safely transitioning legacy monolith applications into microservices.</p>
              <div className="post-meta">
                <div className="author-info">
                  <div className="author-avatar" style={{backgroundImage: 'url("https://ui-avatars.com/api/?name=Abraham+Yoo&background=0D8ABC&color=fff")', backgroundSize: 'cover'}}></div>
                  <span className="author-name">Abraham Yoo</span>
                </div>
                <span className="post-date">Sep 12, 2026</span>
              </div>
            </div>
          </article>

          {/* Post 3 */}
          <article className="post-card">
            <div className="post-card-image" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
            <div className="post-card-content">
              <span className="post-category">Database</span>
              <h3 className="post-title"><a href="#">Mastering Transaction Isolation Levels in SQL</a></h3>
              <p className="post-excerpt">Deep dive into dirty reads, phantom reads, and how to effectively lock records during concurrent transactions.</p>
              <div className="post-meta">
                <div className="author-info">
                  <div className="author-avatar" style={{backgroundImage: 'url("https://ui-avatars.com/api/?name=Abraham+Yoo&background=0D8ABC&color=fff")', backgroundSize: 'cover'}}></div>
                  <span className="author-name">Abraham Yoo</span>
                </div>
                <span className="post-date">Aug 05, 2026</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
