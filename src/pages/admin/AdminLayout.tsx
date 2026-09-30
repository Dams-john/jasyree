import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { BarChart2, BookOpen, Users, Tag, PenTool, Megaphone, Gift, Settings, Menu, X, Home, TrendingUp, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAvatarUrl } from '../../lib/avatar';
