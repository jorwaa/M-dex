export default {
    mangas: {
        'endpoint': '/api/mangas?',
        'isAuthenticated': 'false',
        latest: {
            'limit': 12,
            'offset': 0,
            'title': null,
            'authors': null,
            'artists': null,
            'year': null,
            'includedTags': null,
            'includedTagsMode': null,
            'excludedTags': null,
            'excludedTagsMode': null,
            'status': null,
            'originalLanguage': null,
            'excludedOriginalLanguage': [],
            'availableTranslatedLanguage': [
                'en',
              ],
            'publicationDemographic': null,
            'ids': null,
            'contentRating': null,
            'createdAtSince': null,
            'updatedAtSince': null,
            'order': {
              'latestUploadedChapter': 'desc',
            },
            'includes': [
              'cover_art'
            ],
            'hasAvailableChapters': 1,
            'group': null,
        }
    },
    user: {
      'endpoint': '/api/userlist?',
      'isAuthenticated': 'true',
      Authentication: {
        '' : '',
      },
      latest: {
        'limit': 20,
        'offset': 0,
        'translatedLanguage': [
          'en',
        ],
        'originalLanguage': null,
        'excludedOriginalLanguage': null,
        'contentRating': null,
        'excludedGroups': null,
        'excludedUploaders': null,
        'includeFutureUpdates': null,
        'createdAtSince': null,
        'updatedAtSince': null,
        'publishAtSince': null,
        'order': {
          'updatedAt': 'desc'
        },
        'includes': [
          'cover_art'
        ]
      }
    }
}

const manga = {
    
}