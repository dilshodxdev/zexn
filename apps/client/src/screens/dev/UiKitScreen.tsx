import { Plus, Send, Settings, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Spinner,
  StatusDot,
} from "@/components/ui";

export function UiKitScreen() {
  const { t } = useTranslation();

  const selectOptions = [
    { value: "student", label: t("dev.selectOption1") },
    { value: "teacher", label: t("dev.selectOption2") },
    { value: "admin", label: t("dev.selectOption3") },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <PageHeader
        title={t("dev.title")}
        subtitle={t("dev.subtitle")}
        actions={
          <Button variant="primary" size="sm" icon={<Sparkles className="h-4 w-4" />}>
            {t("dev.sampleAction")}
          </Button>
        }
      />

      <div className="mt-8 flex flex-col gap-8">
        {/* Buttons section */}
        <Card title={t("dev.buttons")}>
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Variants
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                States & Icons
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button icon={<Send className="h-4 w-4" />}>With Icon</Button>
                <Button variant="danger" icon={<Trash2 className="h-4 w-4" />}>
                  Delete
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Full Width
              </p>
              <Button fullWidth variant="secondary">
                Full Width Button
              </Button>
            </div>
          </div>
        </Card>

        {/* Inputs & Select section */}
        <Card title={t("dev.inputs")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label={t("dev.inputLabel")} placeholder={t("dev.inputPlaceholder")} />
            <Input
              label={t("dev.inputLabel")}
              placeholder={t("dev.inputPlaceholder")}
              hint={t("dev.inputHint")}
            />
            <Input label={t("dev.inputLabel")} defaultValue="admin" error={t("dev.inputError")} />
            <Input label={t("dev.inputLabel")} disabled placeholder={t("dev.inputPlaceholder")} />
            <Select label={t("dev.selectLabel")} options={selectOptions} />
            <Select
              label={t("dev.selectLabel")}
              options={selectOptions}
              error={t("dev.inputError")}
            />
          </div>
        </Card>

        {/* Badges & StatusDot section */}
        <Card title={t("dev.badges")}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Badge Tones
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="neutral">neutral</Badge>
                <Badge tone="brand">brand</Badge>
                <Badge tone="ok">ok</Badge>
                <Badge tone="warn">warn</Badge>
                <Badge tone="danger">danger</Badge>
                <Badge tone="info">info</Badge>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                StatusDot
              </p>
              <div className="flex items-center gap-6 text-sm text-text">
                <span className="flex items-center gap-2">
                  <StatusDot ok /> Online
                </span>
                <span className="flex items-center gap-2">
                  <StatusDot ok={false} /> Offline
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Spinners section */}
        <Card title={t("dev.spinners")}>
          <div className="flex items-center gap-6 text-brand">
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-xs text-muted">size=sm</span>
            </div>
            <div className="flex items-center gap-2">
              <Spinner size="md" />
              <span className="text-xs text-muted">size=md</span>
            </div>
          </div>
        </Card>

        {/* Cards section */}
        <Card title={t("dev.cards")}>
          <div className="flex flex-col gap-4">
            <Card
              title="Card with Actions"
              subtitle="Card subtitle text"
              actions={
                <Button variant="ghost" size="sm" icon={<Settings className="h-4 w-4" />}>
                  Settings
                </Button>
              }
            >
              <p className="text-sm text-muted">
                Standard card with md padding, header, actions, and children content.
              </p>
            </Card>

            <Card padding="none">
              <div className="p-4 border-b border-line">
                <p className="text-sm font-semibold text-text">Card with padding=none</p>
              </div>
              <div className="p-4 text-xs text-muted">
                Useful for custom table layouts or flush media content.
              </div>
            </Card>
          </div>
        </Card>

        {/* Feedback states section */}
        <Card title={t("dev.feedback")}>
          <div className="flex flex-col gap-6">
            <EmptyState
              title={t("dev.emptyTitle")}
              description={t("dev.emptyDesc")}
              action={
                <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
                  {t("dev.createTask")}
                </Button>
              }
            />

            <ErrorState message={t("dev.errorMessage")} onRetry={() => {}} />
          </div>
        </Card>
      </div>
    </div>
  );
}
