import { UserRound, UserRoundPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { buildFamilyTreeModel } from '@/lib/familyTree';
import { cn } from '@/lib/utils';

function TreeConnector({ showDown = true, className }) {
  return (
    <div className={cn('flex flex-col items-center', className)} aria-hidden>
      <div className="h-4 w-px bg-border" />
      {showDown && <div className="h-px w-full min-w-[2rem] bg-border" />}
    </div>
  );
}

function PersonCard({ node, subtitle }) {
  return (
    <div
      className={cn(
        'flex min-w-[7rem] max-w-[9rem] flex-col items-center rounded-xl border px-3 py-3 text-center shadow-sm',
        node.isRoot
          ? 'border-primary bg-primary/8 ring-2 ring-primary/25'
          : 'border-border bg-card',
      )}
    >
      <div
        className={cn(
          'mb-2 flex h-10 w-10 items-center justify-center rounded-full',
          node.isRoot ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <UserRound className="h-5 w-5" />
      </div>
      <p className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{node.label}</p>
      {subtitle && (
        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function GhostCard({ label }) {
  return (
    <div className="flex min-w-[7rem] max-w-[9rem] flex-col items-center rounded-xl border border-dashed border-muted-foreground/45 bg-muted/30 px-3 py-3 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground/70">
        <UserRoundPlus className="h-5 w-5" />
      </div>
      <p className="line-clamp-3 text-sm font-medium leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

function GenerationRow({ children, className }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-center gap-3 sm:gap-5', className)}>
      {children}
    </div>
  );
}

/**
 * Visual family tree for one member, with ghost placeholders for inferred relatives.
 *
 * @param {object} props
 * @param {string} props.rootUid
 * @param {Array<{ toUserId: string, relationship: string }>} props.rootLinks
 * @param {Array<{ uid: string, links: Array<{ toUserId: string, relationship: string }> }>} props.related
 * @param {Array<{ id: string, displayName?: string, email?: string }>} props.users
 */
export default function FamilyTreeView({ rootUid, rootLinks, related, users }) {
  const { t } = useLanguage();
  const model = buildFamilyTreeModel(rootUid, rootLinks, related, users);

  const hasParents = model.parents.length > 0;
  const hasCurrentGen = model.siblings.length > 0 || model.spouses.length > 0 || model.root;
  const hasChildren = model.children.length > 0;
  const isEmpty = !hasParents && model.siblings.length === 0 && model.spouses.length === 0 && !hasChildren;

  if (isEmpty) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {t('admin.users.familyTree.empty')}
      </p>
    );
  }

  const renderNode = (node, subtitle) => {
    if (node.kind === 'ghost') {
      return <GhostCard key={node.id} label={t(node.labelKey)} />;
    }
    return <PersonCard key={node.id} node={node} subtitle={subtitle} />;
  };

  const currentGeneration = [
    ...model.siblings.map((n) => renderNode(n, t('admin.users.familyTree.sibling'))),
    renderNode(model.root, t('admin.users.familyTree.focus')),
    ...model.spouses.map((n) => renderNode(n, t('admin.users.familyTree.spouse'))),
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-muted/15 p-4 sm:p-6">
      <p className="mb-4 text-center text-xs text-muted-foreground">{t('admin.users.familyTree.hint')}</p>

      <div className="mx-auto flex min-w-[18rem] max-w-3xl flex-col items-center gap-2">
        {hasParents && (
          <>
            <GenerationRow>
              {model.parents.map((node) =>
                renderNode(
                  node,
                  node.kind === 'person' ? t('admin.users.familyTree.parent') : undefined,
                ),
              )}
            </GenerationRow>
            <TreeConnector />
          </>
        )}

        {hasCurrentGen && (
          <>
            <GenerationRow>{currentGeneration}</GenerationRow>
            {hasChildren && <TreeConnector />}
          </>
        )}

        {hasChildren && (
          <GenerationRow>
            {model.children.map((n) => renderNode(n, t('admin.users.familyTree.child')))}
          </GenerationRow>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-border bg-card" />
          {t('admin.users.familyTree.legendMember')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-dashed border-muted-foreground/50 bg-muted/30" />
          {t('admin.users.familyTree.legendGhost')}
        </span>
      </div>
    </div>
  );
}
