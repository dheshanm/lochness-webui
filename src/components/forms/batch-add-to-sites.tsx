import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Site {
  site_id: string;
  site_name: string;
}

interface BatchAddToSitesProps {
  mode: 'source' | 'sink';
  project_id: string;
  sites: Site[];
  onSuccess?: () => void;
}

export default function BatchAddToSites({ mode, project_id, sites, onSuccess }: BatchAddToSitesProps) {
  const [selectedSiteIds, setSelectedSiteIds] = React.useState<string[]>([]);
  const [type, setType] = React.useState<string>('redcap');
  const [keystoreName, setKeystoreName] = React.useState('');
  const [endpoint, setEndpoint] = React.useState('');
  const [bucket, setBucket] = React.useState('');
  const [subjectIdVariable, setSubjectIdVariable] = React.useState('');
  const [apiEndpoint, setApiEndpoint] = React.useState('');
  const [apiUrl, setApiUrl] = React.useState('');
  const [siteUrl, setSiteUrl] = React.useState('');
  const [formId, setFormId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ success: string[]; failed: string[] }>({ success: [], failed: [] });

  const handleSiteToggle = (site_id: string) => {
    setSelectedSiteIds(prev => prev.includes(site_id) ? prev.filter(id => id !== site_id) : [...prev, site_id]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSiteIds.length) {
      toast.error('Please select at least one site.');
      return;
    }
    if (!keystoreName) {
      toast.error('Keystore name is required.');
      return;
    }
    setLoading(true);
    setResult({ success: [], failed: [] });
    
    let metadata: Record<string, any> = { keystore_name: keystoreName };
    
    // Add type-specific fields
    switch (type) {
      case 'redcap':
        if (!endpoint || !subjectIdVariable) {
          toast.error('Endpoint URL and Subject ID Variable are required for REDCap.');
          setLoading(false);
          return;
        }
        metadata.endpoint_url = endpoint;
        metadata.subject_id_variable = subjectIdVariable;
        break;
      case 'xnat':
        if (!endpoint || !subjectIdVariable) {
          toast.error('Endpoint URL and Subject ID Variable are required for XNAT.');
          setLoading(false);
          return;
        }
        metadata.endpoint_url = endpoint;
        metadata.subject_id_variable = subjectIdVariable;
        break;
      case 'cantab':
        if (!apiEndpoint) {
          toast.error('API Endpoint is required for CANTAB.');
          setLoading(false);
          return;
        }
        metadata.api_endpoint = apiEndpoint;
        break;
      case 'mindlamp':
        if (!apiUrl) {
          toast.error('API URL is required for MindLAMP.');
          setLoading(false);
          return;
        }
        metadata.api_url = apiUrl;
        metadata.project_id = project_id;
        break;
      case 'sharepoint':
        if (!siteUrl || !formId) {
          toast.error('Site URL and Form ID are required for SharePoint.');
          setLoading(false);
          return;
        }
        metadata.site_url = siteUrl;
        metadata.form_id = formId;
        break;
      case 'minio':
        if (!endpoint || !bucket) {
          toast.error('Endpoint and Bucket are required for MinIO.');
          setLoading(false);
          return;
        }
        metadata.endpoint = endpoint;
        metadata.bucket = bucket;
        break;
    }

    const payload = {
      site_ids: selectedSiteIds,
      data_source_type: type,
      [`data_${mode}_metadata`]: metadata,
    };
    
    const endpointUrl = `/api/v1/projects/${project_id}/batch-add-data-${mode === 'source' ? 'sources' : 'sinks'}`;
    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setResult({ success: data.success || [], failed: data.failed || [] });
        toast.success(`Batch add complete: ${data.success?.length || 0} succeeded, ${data.failed?.length || 0} failed.`);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || 'Batch add failed.');
      }
    } catch (error) {
      toast.error('Batch add failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-medium mb-1">Select Sites</label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2 bg-muted">
          {sites.map(site => (
            <label key={site.site_id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSiteIds.includes(site.site_id)}
                onChange={() => handleSiteToggle(site.site_id)}
                className="accent-primary"
              />
              <span>{site.site_name} <span className="text-xs text-gray-400">({site.site_id})</span></span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Type</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="redcap">REDCap</SelectItem>
            <SelectItem value="xnat">XNAT</SelectItem>
            <SelectItem value="cantab">CANTAB</SelectItem>
            <SelectItem value="mindlamp">MindLAMP</SelectItem>
            <SelectItem value="sharepoint">SharePoint</SelectItem>
            <SelectItem value="minio">MinIO</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-medium mb-1">Keystore Name</label>
        <Input value={keystoreName} onChange={e => setKeystoreName(e.target.value)} placeholder="e.g., redcap_prod_token" />
        <p className="text-xs text-gray-500 mt-1">Reference a secret stored in the keystore.</p>
      </div>
      
      {/* REDCap fields */}
      {(type === 'redcap' || type === 'xnat') && (
        <>
          <div>
            <label className="block font-medium mb-1">Endpoint URL</label>
            <Input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder={type === 'redcap' ? "https://redcap.example.com" : "https://xnat.example.com"} />
          </div>
          <div>
            <label className="block font-medium mb-1">Subject ID Variable</label>
            <Input value={subjectIdVariable} onChange={e => setSubjectIdVariable(e.target.value)} placeholder="subject_id" />
          </div>
        </>
      )}
      
      {/* CANTAB fields */}
      {type === 'cantab' && (
        <div>
          <label className="block font-medium mb-1">API Endpoint</label>
          <Input value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} placeholder="https://app.cantab.com/api" />
        </div>
      )}
      
      {/* MindLAMP fields */}
      {type === 'mindlamp' && (
        <div>
          <label className="block font-medium mb-1">API URL</label>
          <Input value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://mindlamp.example.com/api" />
        </div>
      )}
      
      {/* SharePoint fields */}
      {type === 'sharepoint' && (
        <>
          <div>
            <label className="block font-medium mb-1">Site URL</label>
            <Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="https://company.sharepoint.com/sites/team" />
          </div>
          <div>
            <label className="block font-medium mb-1">Form ID</label>
            <Input value={formId} onChange={e => setFormId(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" />
          </div>
        </>
      )}
      
      {/* MinIO fields */}
      {type === 'minio' && (
        <>
          <div>
            <label className="block font-medium mb-1">Endpoint</label>
            <Input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://minio.example.com" />
          </div>
          <div>
            <label className="block font-medium mb-1">Bucket</label>
            <Input value={bucket} onChange={e => setBucket(e.target.value)} placeholder="my-bucket" />
          </div>
        </>
      )}
      
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Adding...' : `Add Data ${mode === 'source' ? 'Source(s)' : 'Sink(s)'}`}</Button>
      </div>
      {(result.success.length > 0 || result.failed.length > 0) && (
        <div className="mt-4">
          {result.success.length > 0 && <div className="text-green-600">Succeeded: {result.success.join(', ')}</div>}
          {result.failed.length > 0 && <div className="text-red-600">Failed: {result.failed.join(', ')}</div>}
        </div>
      )}
    </form>
  );
} 