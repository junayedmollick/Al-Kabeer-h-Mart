import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, CheckCircle2, AlertCircle, Trash2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

export function ProductReviews({ productId }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    api('/products/' + encodeURIComponent(productId) + '/reviews')
      .then((result) => {
        if (active) {
          setData(result);
          if (result.ownReview) {
            setRating(result.ownReview.rating || 5);
            setComment(result.ownReview.comment || '');
          }
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [productId, user?.id]);

  async function save(e, remove = false) {
    e?.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const updated = await api('/products/' + encodeURIComponent(productId) + '/reviews', {
        method: remove ? 'DELETE' : 'PUT',
        body: remove ? undefined : { rating, comment },
      });
      setData(updated);
      setSaved(!remove);
      if (remove) {
        setComment('');
        setRating(5);
      }
    } catch (err) {
      setError(err.message || 'Failed to save feedback');
    } finally {
      setBusy(false);
    }
  }

  const reviewCount = data?.count || 0;
  const averageRating = data?.average ? data.average.toFixed(1) : '0.0';

  const getRatingLabel = (score) => {
    return t(`reviews.ratingLabels.${score}`) || (score === 5 ? 'Excellent' : `${score} Stars`);
  };

  return (
    <section className="mt-8 bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {t('reviews.title')}
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {t('reviews.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-soft px-4 py-2.5 rounded-2xl border border-border shrink-0">
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                />
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              {reviewCount === 0 ? t('reviews.noRatingsYet') : `${reviewCount} ${reviewCount === 1 ? t('reviews.review') : t('reviews.reviews')}`}
            </p>
          </div>
          <span className="text-2xl font-black text-text-primary">
            {reviewCount > 0 ? averageRating : '—'}
          </span>
        </div>
      </div>

      {/* Write / Edit Review Form or Sign In Callout */}
      {user?.role === 'customer' ? (
        <form onSubmit={save} className="p-5 sm:p-6 rounded-2xl bg-surface-soft border border-border space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              {data?.ownReview ? t('reviews.updateReview') : t('reviews.leaveFeedback')}
            </h3>
            {data?.ownReview && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t('reviews.alreadyReviewed')}
              </span>
            )}
          </div>

          {/* Interactive Star Picker */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">
              {t('reviews.selectRating')} <span className="text-amber-500 font-extrabold">{getRatingLabel(hoverRating || rating)}</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-hidden"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    size={26}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-slate-300 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text Input */}
          <div>
            <label htmlFor="customer-comment" className="block text-xs font-bold text-text-secondary mb-1.5">
              {t('reviews.yourReview')}
            </label>
            <textarea
              id="customer-comment"
              required
              minLength={3}
              maxLength={2000}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('reviews.placeholder')}
              className="w-full p-3.5 rounded-xl bg-surface border border-border text-xs sm:text-sm text-text-primary focus:outline-hidden focus:border-primary transition-colors"
            />
            <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
              <span>{t('reviews.nameNotice')}</span>
              <span>{comment.length} / 2000</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={busy || !data || !comment.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {busy ? '...' : data?.ownReview ? t('reviews.updateFeedback') : t('reviews.submitReview')}
            </button>
            {data?.ownReview && (
              <button
                type="button"
                disabled={busy}
                onClick={() => save(null, true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{t('reviews.removeReview')}</span>
              </button>
            )}
          </div>

          {saved && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
              <CheckCircle2 size={16} />
              <span>{t('reviews.thankYou')}</span>
            </div>
          )}
        </form>
      ) : user?.role === 'admin' ? (
        <div className="p-4 rounded-2xl bg-surface-soft border border-border text-xs text-text-secondary flex items-center justify-between gap-3">
          <span>{t('reviews.adminNotice')}</span>
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px] uppercase">
            {t('reviews.adminBadge')}
          </span>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-surface-soft border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary">{t('reviews.wantToShare')}</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {t('reviews.signInPrompt')}
            </p>
          </div>
          <Link
            to="/login"
            state={{ from: { pathname: '/product/' + encodeURIComponent(productId) } }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all hover:scale-105 shrink-0"
          >
            <User size={14} />
            <span>{t('reviews.signInBtn')}</span>
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4 pt-2">
        {data?.reviews && data.reviews.length > 0 ? (
          <div className="divide-y divide-border/60">
            {data.reviews.map((r, index) => (
              <article key={index} className="py-4 space-y-1.5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-text-primary">{r.name}</span>
                    {r.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 size={11} />
                        {t('reviews.verifiedPurchase')}
                      </span>
                    )}
                    {r.mine && (
                      <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                        {t('reviews.yourReviewBadge')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {new Date(r.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                    />
                  ))}
                  <span className="text-xs font-bold text-text-secondary ml-1.5">
                    {getRatingLabel(r.rating)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
                  {r.comment}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-2xl bg-surface-soft/40 border border-border/50">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2">
              <Star size={20} className="fill-amber-400" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-text-primary">{t('reviews.noReviewsTitle')}</p>
            <p className="text-xs text-text-muted mt-0.5 max-w-sm mx-auto">
              {t('reviews.noReviewsDesc')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
