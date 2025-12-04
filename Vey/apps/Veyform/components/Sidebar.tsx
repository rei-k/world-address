'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  LinkIcon,
  KeyIcon,
  BellIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Integration Builder',
    href: '/dashboard/integration-builder',
    icon: WrenchScrewdriverIcon,
  },
  { name: 'Connect', href: '/dashboard/connect', icon: LinkIcon },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: KeyIcon },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: BellIcon },
  { name: 'Monitor', href: '/dashboard/monitor', icon: ChartBarIcon },
  { name: 'Live Logs', href: '/dashboard/live-logs', icon: DocumentTextIcon },
  { name: 'Setting', href: '/dashboard/setting', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-white">Veyform</h1>
        </div>
        <nav className="flex-1 px-2 mt-5 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive
                      ? 'text-gray-300'
                      : 'text-gray-400 group-hover:text-gray-300',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400">
            <p>© 2025 Vey Team</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
