import { useState } from 'react';
import { Send, MessageSquare, MessageCircleMore } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { COMMENTS } from '../data/users';
import { getAvatarUrl } from '../lib/avatar';
