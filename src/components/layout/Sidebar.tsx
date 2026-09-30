import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Coins, Tag, Gift, Bell, Users, User, Settings, X, BookMarked } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getAvatarUrl } from '../lib/avatar';
