export const COLLAB_ROOM_QUERY_PARAM = 'room';

export interface ResolvedCollaborationRoom {
  roomId: string;
  shouldWriteToUrl: boolean;
}

export function resolveCollaborationRoomId(search: string, fallbackRoomId: string): ResolvedCollaborationRoom {
  const params = new URLSearchParams(search);
  const roomParam = params.get(COLLAB_ROOM_QUERY_PARAM)?.trim() ?? '';
  if (roomParam.length > 0) {
    return {
      roomId: roomParam,
      shouldWriteToUrl: false,
    };
  }

  return {
    roomId: fallbackRoomId,
    shouldWriteToUrl: true,
  };
}

export function buildCollaborationInviteUrl(currentHref: string, roomId: string): string {
  const url = new URL(currentHref);
  url.searchParams.set(COLLAB_ROOM_QUERY_PARAM, roomId);
  return url.toString();
}
