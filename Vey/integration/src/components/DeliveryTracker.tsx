/**
 * DeliveryTracker React Component
 * 
 * Real-time delivery tracking with privacy-preserving updates.
 * Shows tracking events without revealing full address to unauthorized parties.
 */

import React, { useState, useEffect } from 'react';
import type { Waybill, TrackingEvent } from '../delivery-flow';

export interface DeliveryTrackerProps {
  /** Waybill/tracking number */
  waybillNumber: string;
  /** Callback to fetch tracking data */
  onFetchTracking?: (waybillNumber: string) => Promise<{ waybill: Waybill; events: TrackingEvent[] }>;
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;
  /** Show full address (only for authorized users) */
  showFullAddress?: boolean;
  /** Compact view */
  compact?: boolean;
}

const statusIcons: Record<Waybill['status'], string> = {
  created: '📦',
  in_transit: '🚚',
  out_for_delivery: '🏃',
  delivered: '✅',
  failed: '❌',
};

const statusColors: Record<Waybill['status'], string> = {
  created: '#2196F3',
  in_transit: '#FF9800',
  out_for_delivery: '#9C27B0',
  delivered: '#4CAF50',
  failed: '#F44336',
};

const eventTypeIcons: Record<TrackingEvent['type'], string> = {
  created: '📋',
  picked_up: '📦',
  in_transit: '🚚',
  arrived_at_facility: '🏢',
  out_for_delivery: '🏃',
  delivered: '✅',
  exception: '⚠️',
};

/**
 * Delivery Tracker Component
 */
export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({
  waybillNumber,
  onFetchTracking,
  refreshInterval = 30000, // 30 seconds
  showFullAddress = false,
  compact = false,
}) => {
  const [trackingData, setTrackingData] = useState<{ waybill: Waybill; events: TrackingEvent[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch tracking data
  const fetchTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (onFetchTracking) {
        const data = await onFetchTracking(waybillNumber);
        setTrackingData(data);
        setLastUpdated(new Date());
      } else {
        // Mock data for demo
        const mockData = generateMockTrackingData(waybillNumber);
        setTrackingData(mockData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTracking();
  }, [waybillNumber]);

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(fetchTracking, refreshInterval);
    return () => clearInterval(interval);
  }, [waybillNumber, refreshInterval]);

  if (isLoading && !trackingData) {
    return (
      <div className="delivery-tracker loading">
        <div className="loading-spinner"></div>
        <p>Loading tracking information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delivery-tracker error">
        <p>❌ Error loading tracking: {error}</p>
        <button onClick={fetchTracking}>Retry</button>
      </div>
    );
  }

  if (!trackingData) {
    return null;
  }

  const { waybill, events } = trackingData;
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (compact) {
    return (
      <div className="delivery-tracker compact">
        <div className="tracker-header-compact">
          <span className="status-icon">{statusIcons[waybill.status]}</span>
          <div className="status-info">
            <span className="status-text">{waybill.status.replace(/_/g, ' ').toUpperCase()}</span>
            <span className="waybill-number">#{waybillNumber}</span>
          </div>
        </div>
        {sortedEvents.length > 0 && (
          <div className="latest-event">
            {eventTypeIcons[sortedEvents[0].type]} {sortedEvents[0].description}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="delivery-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-left">
          <h2>Delivery Tracking</h2>
          <p className="waybill-number">Tracking #: {waybillNumber}</p>
        </div>
        <div className="header-right">
          <div className="status-badge" style={{ backgroundColor: statusColors[waybill.status] }}>
            {statusIcons[waybill.status]} {waybill.status.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Delivery Summary */}
      <div className="delivery-summary">
        <div className="summary-item">
          <label>Carrier</label>
          <span>{waybill.carrier.name}</span>
        </div>
        <div className="summary-item">
          <label>Service</label>
          <span>{waybill.service}</span>
        </div>
        <div className="summary-item">
          <label>Created</label>
          <span>{new Date(waybill.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="summary-item">
          <label>Est. Delivery</label>
          <span>{new Date(waybill.estimatedDeliveryAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Sender/Recipient Info (Privacy-Preserving) */}
      <div className="parties-info">
        <div className="party">
          <label>From</label>
          <span className="convey-id">{waybill.sender.conveyId}</span>
          {waybill.sender.name && <span className="party-name">{waybill.sender.name}</span>}
        </div>
        <div className="arrow">→</div>
        <div className="party">
          <label>To</label>
          <span className="convey-id">{waybill.recipient.conveyId}</span>
          {waybill.recipient.name && <span className="party-name">{waybill.recipient.name}</span>}
        </div>
      </div>

      {/* ZKP Privacy Notice */}
      {!showFullAddress && (
        <div className="privacy-notice">
          <p>🔒 Addresses are protected by Zero-Knowledge Proofs</p>
          <p>Only the carrier can see full delivery address</p>
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="tracking-timeline">
        <h3>Tracking History</h3>
        {sortedEvents.length === 0 ? (
          <p className="no-events">No tracking events yet</p>
        ) : (
          <div className="timeline">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="timeline-item">
                <div className="timeline-marker">
                  <span className="event-icon">{eventTypeIcons[event.type]}</span>
                </div>
                <div className="timeline-content">
                  <div className="event-time">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                  <div className="event-description">{event.description}</div>
                  {event.location && (
                    <div className="event-location">📍 {event.location}</div>
                  )}
                  {event.metadata && (
                    <div className="event-metadata">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <span key={key}>
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <style jsx>{`
        .delivery-tracker {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 0 auto;
        }

        .delivery-tracker.compact {
          padding: 16px;
          border: 1px solid #e0e0e0;
        }

        .delivery-tracker.loading,
        .delivery-tracker.error {
          text-align: center;
          padding: 48px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2196F3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .tracker-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }

        .waybill-number {
          color: #666;
          font-size: 14px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .delivery-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
        }

        .summary-item label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .summary-item span {
          font-weight: 600;
        }

        .parties-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 16px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .party {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .party label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .convey-id {
          font-weight: 600;
          color: #2196F3;
          margin-bottom: 4px;
        }

        .party-name {
          font-size: 14px;
          color: #666;
        }

        .arrow {
          font-size: 24px;
          color: #999;
          margin: 0 16px;
        }

        .privacy-notice {
          background: #e3f2fd;
          border-left: 4px solid #2196F3;
          padding: 12px 16px;
          margin-bottom: 24px;
          border-radius: 4px;
        }

        .privacy-notice p {
          margin: 4px 0;
          font-size: 14px;
        }

        .tracking-timeline h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .timeline {
          position: relative;
          padding-left: 40px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e0e0e0;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 24px;
        }

        .timeline-marker {
          position: absolute;
          left: -40px;
          top: 0;
          width: 32px;
          height: 32px;
          background: white;
          border: 2px solid #2196F3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .event-icon {
          font-size: 16px;
        }

        .timeline-content {
          background: #f9f9f9;
          padding: 12px 16px;
          border-radius: 8px;
        }

        .event-time {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .event-description {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .event-location {
          font-size: 14px;
          color: #666;
        }

        .event-metadata {
          margin-top: 8px;
          font-size: 12px;
          color: #999;
        }

        .event-metadata span {
          margin-right: 12px;
        }

        .last-updated {
          text-align: center;
          font-size: 12px;
          color: #999;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .no-events {
          text-align: center;
          color: #999;
          padding: 32px;
        }

        .tracker-header-compact {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .status-icon {
          font-size: 24px;
        }

        .status-info {
          display: flex;
          flex-direction: column;
        }

        .status-text {
          font-weight: 600;
          font-size: 14px;
        }

        .latest-event {
          font-size: 14px;
          color: #666;
          padding: 8px 0;
        }
      `}</style>
    </div>
  );
};

/**
 * Generate mock tracking data for demo purposes
 */
function generateMockTrackingData(waybillNumber: string): { waybill: Waybill; events: TrackingEvent[] } {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const mockWaybill: Waybill = {
    number: waybillNumber,
    carrier: {
      id: 'vey-express',
      name: 'Vey Express',
      did: 'did:vey:carrier:vey-express',
      countries: ['JP', 'US', 'GB'],
      services: {
        standard: true,
        express: true,
        overnight: true,
        international: true,
      },
    },
    service: 'express',
    sender: {
      conveyId: 'store@convey.store',
      name: 'Cool Gadgets Store',
    },
    recipient: {
      conveyId: 'alice@convey',
      name: 'Alice T.',
    },
    package: {
      weight: 1.5,
      dimensions: { length: 30, width: 20, height: 15 },
      value: 5000,
      currency: 'JPY',
    },
    zkpProof: {
      type: 'selective-reveal',
      commitment: 'abc123...',
    },
    status: 'in_transit',
    createdAt: yesterday.toISOString(),
    estimatedDeliveryAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };

  const mockEvents: TrackingEvent[] = [
    {
      id: 'evt1',
      waybillNumber,
      type: 'created',
      description: 'Waybill created',
      timestamp: yesterday.toISOString(),
    },
    {
      id: 'evt2',
      waybillNumber,
      type: 'picked_up',
      description: 'Package picked up by carrier',
      location: 'Tokyo Distribution Center',
      timestamp: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt3',
      waybillNumber,
      type: 'in_transit',
      description: 'In transit to destination',
      location: 'Osaka Hub',
      timestamp: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt4',
      waybillNumber,
      type: 'arrived_at_facility',
      description: 'Arrived at destination facility',
      location: 'Shibuya Distribution Center',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return { waybill: mockWaybill, events: mockEvents };
}

export default DeliveryTracker;
