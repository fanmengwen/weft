import React from 'react';
import { ServerCog } from 'lucide-react';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { Select } from '../ui/Select';
import { INSPECTOR_INPUT_CLASSNAME, InspectorField } from './InspectorPrimitives';
import { ENVIRONMENT_OPTIONS, RESOURCE_TYPE_OPTIONS } from './families/architectureOptions';

interface CommonSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}

interface ArchitectureBulkSectionProps extends CommonSectionProps {
  archEnvironment: string;
  archResourceType: string;
  archZone: string;
  archTrustDomain: string;
  onEnvironmentChange: (value: string) => void;
  onResourceTypeChange: (value: string) => void;
  onZoneChange: (value: string) => void;
  onTrustDomainChange: (value: string) => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function ArchitectureBulkSection({
  title,
  isOpen,
  onToggle,
  archEnvironment,
  archResourceType,
  archZone,
  archTrustDomain,
  onEnvironmentChange,
  onResourceTypeChange,
  onZoneChange,
  onTrustDomainChange,
  onInputKeyDown,
}: ArchitectureBulkSectionProps): React.ReactElement {
  return (
    <CollapsibleSection
      title={title}
      icon={<ServerCog className="w-3.5 h-3.5" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <InspectorField label="Environment">
            <Select
              value={archEnvironment}
              onChange={onEnvironmentChange}
              options={ENVIRONMENT_OPTIONS}
              placeholder="Select environment"
            />
          </InspectorField>
          <InspectorField label="Resource Type">
            <Select
              value={archResourceType}
              onChange={onResourceTypeChange}
              options={RESOURCE_TYPE_OPTIONS}
              placeholder="Select resource type"
            />
          </InspectorField>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InspectorField label="Zone">
            <input
              value={archZone}
              onChange={(event) => onZoneChange(event.target.value)}
              onKeyDown={onInputKeyDown}
              className={INSPECTOR_INPUT_CLASSNAME}
              placeholder="e.g. us-east-1"
            />
          </InspectorField>
          <InspectorField label="Trust Domain">
            <input
              value={archTrustDomain}
              onChange={(event) => onTrustDomainChange(event.target.value)}
              onKeyDown={onInputKeyDown}
              className={INSPECTOR_INPUT_CLASSNAME}
              placeholder="e.g. internal"
            />
          </InspectorField>
        </div>
      </div>
    </CollapsibleSection>
  );
}
