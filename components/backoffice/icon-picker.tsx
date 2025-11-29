'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// Liste des icônes populaires pour l'application ferroviaire
const POPULAR_ICONS = [
  'Train',
  'TrainFront',
  'TrainTrack',
  'AlertTriangle',
  'AlertCircle',
  'Wrench',
  'Settings',
  'Gauge',
  'Zap',
  'Flag',
  'MapPin',
  'Navigation',
  'Compass',
  'Target',
  'CheckCircle',
  'XCircle',
  'Info',
  'HelpCircle',
  'Shield',
  'ShieldAlert',
  'Bell',
  'BellRing',
  'Clock',
  'Timer',
  'Calendar',
  'FileText',
  'Clipboard',
  'ClipboardCheck',
  'BookOpen',
  'Book',
  'Bookmark',
  'Star',
  'Heart',
  'ThumbsUp',
  'ThumbsDown',
  'TrendingUp',
  'TrendingDown',
  'Activity',
  'BarChart',
  'PieChart',
  'Layers',
  'Box',
  'Package',
  'Archive',
  'Folder',
  'FolderOpen',
  'File',
  'FileQuestion',
  'Search',
  'Filter',
  'SlidersHorizontal',
  'Settings2',
  'Tool',
  'Hammer',
  'Cog',
  'Power',
  'Plug',
  'Battery',
  'BatteryCharging',
  'Wifi',
  'WifiOff',
  'Signal',
  'Radio',
  'Antenna',
  'Satellite',
  'Route',
  'Map',
  'MapPinned',
  'Milestone',
  'Construction',
  'HardHat',
  'Truck',
  'Car',
  'Bus',
  'Bike',
  'Plane',
  'Ship',
  'Anchor',
  'Fuel',
  'Gauge',
  'Speedometer',
];

interface IconPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onValueChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filtrer les icônes selon la recherche
  const filteredIcons = POPULAR_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  // Récupérer le composant d'icône
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.HelpCircle;
  };

  const SelectedIcon = value ? getIconComponent(value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800 hover:text-white"
        >
          <div className="flex items-center gap-2">
            {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
            <span className={cn(!value && 'text-slate-500')}>
              {value || 'Sélectionner une icône...'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-slate-900 border-slate-800" align="start">
        <Command className="bg-slate-900">
          <CommandInput
            placeholder="Rechercher une icône..."
            value={search}
            onValueChange={setSearch}
            className="border-slate-800 text-white placeholder:text-slate-500"
          />
          <CommandList>
            <CommandEmpty className="text-slate-400 py-6 text-center text-sm">
              Aucune icône trouvée
            </CommandEmpty>
            <CommandGroup className="p-2">
              <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
                {filteredIcons.map((iconName) => {
                  const IconComponent = getIconComponent(iconName);
                  const isSelected = value === iconName;

                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={() => {
                        onValueChange(iconName);
                        setOpen(false);
                        setSearch('');
                      }}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 p-3 cursor-pointer rounded-md hover:bg-slate-800',
                        isSelected && 'bg-slate-800 ring-2 ring-primary'
                      )}
                    >
                      <IconComponent className="h-5 w-5 text-slate-300" />
                      {isSelected && (
                        <Check className="h-3 w-3 text-primary absolute top-1 right-1" />
                      )}
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}