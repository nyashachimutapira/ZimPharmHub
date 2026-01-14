import React, { useState, useEffect } from 'react';
import { getActivityFeed, addEventListener } from '../services/realtimeService';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    fetchActivityFeed(0);

    // Subscribe to real-time activity events
    const unsubscribe = addEventListener('profile_viewed', (data) => {
      addActivityToFeed({
        id: `profile_view_${Date.now()}`,
        action: 'view_profile',
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        createdAt: new Date(),
      });
    });

    return () => unsubscribe();
  }, []);

  const fetchActivityFeed = async (newOffset) => {
    setIsLoading(true);
    try {
      const response = await getActivityFeed(LIMIT, newOffset);
      if (response.success) {
        if (newOffset === 0) {
          setActivities(response.activities);
        } else {
          setActivities((prev) => [...prev, ...response.activities]);
        }
        setHasMore(response.activities.length === LIMIT);
        setOffset(newOffset + LIMIT);
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivityToFeed = (activity) => {
    setActivities((prev) => [activity, ...prev]);
  };

  const getActivityIcon = (action) => {
    const icons = {
      view_profile: '👁️',
      save_job: '⭐',
      message_sent: '💬',
      applied: '📝',
      profile_updated: '✏️',
      job_shared: '🔗',
      recommendation: '✨',
    };
    return icons[action] || '📌';
  };

  const getActivityDescription = (activity) => {
    const user = activity.userName || `User #${activity.userId}`;

    switch (activity.action) {
      case 'view_profile':
        return `${user} viewed your profile`;
      case 'save_job':
        return `${user} saved a job you posted`;
      case 'message_sent':
        return `${user} sent you a message`;
      case 'applied':
        return `${user} applied for your job`;
      case 'profile_updated':
        return `${user} updated their profile`;
      case 'job_shared':
        return `${user} shared your job`;
      case 'recommendation':
        return `You received a recommendation from ${user}`;
      default:
        return `Activity from ${user}`;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  };

  const getActivityColor = (action) => {
    const colors = {
      view_profile: 'bg-green-50 border-green-200 text-green-700',
      save_job: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      message_sent: 'bg-purple-50 border-purple-200 text-purple-700',
      applied: 'bg-blue-50 border-blue-200 text-blue-700',
      profile_updated: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      job_shared: 'bg-pink-50 border-pink-200 text-pink-700',
      recommendation: 'bg-orange-50 border-orange-200 text-orange-700',
    };
    return colors[action] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold">Your Activity Feed</h2>
        <p className="text-blue-100 mt-1">
          Stay updated on who's interacting with your profile
        </p>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-b-lg shadow-lg">
        {isLoading && activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-500 mt-3">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium">No activity yet</p>
            <p className="text-sm">
              When people interact with your profile, it will show up here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity, index) => (
              <div
                key={activity.id || index}
                className={`p-4 hover:bg-gray-50 transition border-l-4 ${getActivityColor(
                  activity.action
                )}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {getActivityIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {getActivityDescription(activity)}
                      </p>
                    </div>

                    {/* User Avatar and Name */}
                    {activity.userAvatar || activity.userName ? (
                      <div className="flex items-center gap-2 mb-2">
                        {activity.userAvatar ? (
                          <img
                            src={activity.userAvatar}
                            alt="User"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-white">
                            {activity.userName?.[0] || 'U'}
                          </div>
                        )}
                        <p className="text-xs text-gray-600">
                          {activity.userName}
                        </p>
                      </div>
                    ) : null}

                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="text-xs text-gray-600 mb-2">
                        <p>
                          {typeof activity.metadata === 'object'
                            ? JSON.stringify(activity.metadata)
                            : activity.metadata}
                        </p>
                      </div>
                    )}

                    {/* Time */}
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => {
                        if (activity.userId) {
                          window.location.href = `/profile/${activity.userId}`;
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && activities.length > 0 && (
          <div className="p-4 text-center border-t border-gray-200">
            <button
              onClick={() => fetchActivityFeed(offset)}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
